/**
 * Airtime Deduction Route — Africa's Talking
 *
 * Two flows:
 *
 * A) USSD-triggered (handled in routes/ussd.js) — user dials, confirms,
 *    wallet is credited immediately in the USSD session.
 *
 * B) Scheduled auto-deduction — Africa's Talking Airtime API deducts
 *    a set amount from the user's airtime balance and credits their PAYG
 *    wallet. This route handles:
 *      POST /api/airtime/settings   — save deduction preferences
 *      GET  /api/airtime/settings   — get current preferences
 *      POST /api/airtime/deduct     — trigger a real airtime deduction (server-side)
 *      POST /api/airtime/callback   — Africa's Talking deduction status webhook
 *
 * Mount in server.js:
 *   app.use("/api/airtime", require("./routes/airtime"));
 */

const express = require("express");
const router = express.Router();
const AfricasTalking = require("africastalking");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Transaction = require("../models/Transaction");
const {
  sendAirtimeDeductionConfirmation,
  sendCoverageActive,
} = require("../utils/sms");
const { createNotification } = require("../utils/notifications");

// ─── Africa's Talking client ──────────────────────────────────────────────────

function getAT() {
  return AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toIntlPhone(phone) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("234")) return `+${d}`;
  if (d.startsWith("0")) return `+234${d.slice(1)}`;
  return `+${d}`;
}

const PLAN_PRICES = { Basic: 500, Standard: 1000, Premium: 2000 };

// ─── GET SETTINGS ─────────────────────────────────────────────────────────────

/**
 * GET /api/airtime/settings
 * Returns the user's current airtime deduction preferences.
 */
router.get("/settings", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "No subscription found" });
    }

    res.json({
      success: true,
      settings: subscription.airtimeDeduction || {
        enabled: false,
        percentage: 10,
        network: null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SAVE SETTINGS ────────────────────────────────────────────────────────────

/**
 * POST /api/airtime/settings
 * Save/update airtime deduction preferences.
 * Body: { enabled: bool, percentage: 10|20|50, network: "MTN"|"Airtel"|"Glo"|"9mobile" }
 */
router.post("/settings", protect, async (req, res) => {
  try {
    const { enabled, percentage, network } = req.body;

    const validPercentages = [10, 20, 50];
    const validNetworks = ["MTN", "Airtel", "Glo", "9mobile"];

    if (enabled && !validPercentages.includes(Number(percentage))) {
      return res.status(400).json({ success: false, message: "Percentage must be 10, 20, or 50" });
    }
    if (enabled && !validNetworks.includes(network)) {
      return res.status(400).json({ success: false, message: "Invalid network" });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          "airtimeDeduction.enabled": !!enabled,
          "airtimeDeduction.percentage": Number(percentage) || 10,
          "airtimeDeduction.network": network || null,
          "airtimeDeduction.updatedAt": new Date(),
        },
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    res.json({
      success: true,
      message: enabled
        ? `Airtime deduction enabled at ${percentage}% on ${network}`
        : "Airtime deduction disabled",
      settings: subscription.airtimeDeduction,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TRIGGER DEDUCTION ────────────────────────────────────────────────────────

/**
 * POST /api/airtime/deduct
 * Trigger a real airtime deduction via Africa's Talking Airtime API.
 * Can be called manually (e.g. from a cron job) or on each recharge event.
 *
 * Body: { amount: number } — amount in NGN to deduct
 *
 * ⚠️  Africa's Talking Airtime API sends airtime TO users (promotional).
 *     True reverse billing (deducting user airtime to pay a service) requires
 *     a USSD Premium / Premium SMS service agreement with the telcos.
 *     This endpoint handles both approaches:
 *       - Direct: deduct via Premium USSD billing (requires telco approval)
 *       - USSD-flow: user confirmed in USSD, we just record the transaction here
 */
router.post("/deduct", protect, async (req, res) => {
  try {
    const { amount, source } = req.body; // source: "ussd" | "auto"

    if (!amount || isNaN(amount) || amount < 50) {
      return res.status(400).json({ success: false, message: "Minimum deduction is ₦50" });
    }

    const user = req.user;
    const subscription = await Subscription.findOne({ user: user._id });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No subscription found" });
    }

    const phone = toIntlPhone(user.phone);

    // ── If source is USSD-confirmed, just credit wallet (billing already done) ──
    if (source === "ussd") {
      subscription.walletBalance += Number(amount);
      await subscription.refreshStatus();
      await subscription.save();

      const txn = await Transaction.create({
        user: user._id,
        amount: Number(amount),
        type: "payment",
        status: "success",
        paystackReference: `AT-USSD-${Date.now()}`,
        channel: "ussd_airtime",
        description: "Airtime deduction via USSD",
      });

      await createNotification(user._id, {
        type: "payment",
        title: "Airtime Top Up",
        body: `₦${Number(amount).toLocaleString()} added to your PAYG wallet via airtime.`,
      });

      await sendAirtimeDeductionConfirmation(user.phone, amount, subscription.walletBalance);

      if (subscription.status === "active") {
        await sendCoverageActive(user.phone, subscription.plan, subscription.coverageEndDate);
      }

      return res.json({
        success: true,
        message: "Wallet credited",
        walletBalance: subscription.walletBalance,
        status: subscription.status,
        transactionId: txn._id,
      });
    }

    // ── Auto-deduction via Africa's Talking Airtime API ───────────────────────
    // Note: This sends airtime (promotional). For reverse billing, use Premium USSD.
    // In production with a telco agreement, replace this with your billing API call.
    const at = getAT();
    const airtime = at.AIRTIME;

    const deductionResult = await airtime.send({
      recipients: [
        {
          phoneNumber: phone,
          amount: `NGN ${amount}`,
          currencyCode: "NGN",
        },
      ],
    });

    const responses = deductionResult.responses || [];
    const successEntry = responses.find((r) => r.status === "Sent");

    if (!successEntry) {
      console.error("Airtime deduction failed:", JSON.stringify(deductionResult));
      return res.status(502).json({
        success: false,
        message: "Airtime deduction failed. Please try card payment.",
        detail: responses[0]?.errorMessage || "Unknown error",
      });
    }

    // Credit wallet
    subscription.walletBalance += Number(amount);
    await subscription.refreshStatus();
    await subscription.save();

    await Transaction.create({
      user: user._id,
      amount: Number(amount),
      type: "payment",
      status: "success",
      paystackReference: `AT-AUTO-${Date.now()}`,
      channel: "airtime_auto",
      description: "Automatic airtime deduction",
      metadata: { atRequestId: successEntry.requestId },
    });

    await createNotification(user._id, {
      type: "payment",
      title: "Airtime Deducted",
      body: `₦${Number(amount).toLocaleString()} automatically added to your PAYG wallet.`,
    });

    await sendAirtimeDeductionConfirmation(user.phone, amount, subscription.walletBalance);

    res.json({
      success: true,
      message: "Airtime deducted and wallet credited",
      walletBalance: subscription.walletBalance,
      status: subscription.status,
    });
  } catch (err) {
    console.error("Airtime deduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── AFRICA'S TALKING CALLBACK ────────────────────────────────────────────────

/**
 * POST /api/airtime/callback
 * Africa's Talking posts status updates here after airtime transactions.
 * Configure in AT dashboard → Airtime → Notification URL
 */
router.post("/callback", async (req, res) => {
  try {
    const { requestId, status, phoneNumber, amount, errorMessage } = req.body;

    console.log(`AT Airtime callback: ${requestId} → ${status}`);

    if (status === "Success") {
      // Find the transaction by requestId stored in metadata
      await Transaction.findOneAndUpdate(
        { "metadata.atRequestId": requestId },
        { $set: { status: "success" } }
      );
    } else {
      console.error(`Airtime failed for ${phoneNumber}: ${errorMessage}`);
      // In production: refund wallet or retry
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("AT callback error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
