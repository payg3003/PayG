# PAYG Backend — Node.js/Express API

Complete REST API for the PAYG Health Insurance platform.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (jsonwebtoken)
- **Payments**: Paystack
- **SMS**: Termii (swappable to Africa's Talking)
- **Security**: Helmet, CORS, express-rate-limit, express-validator

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your keys
cp .env.example .env

# 3. Start in development mode (with auto-reload)
npm run dev

# 4. Test the health endpoint
curl http://localhost:5000/health
```

---

## Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | mongodb.com/atlas → Connect → Drivers |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `PAYSTACK_SECRET_KEY` | dashboard.paystack.com → Settings → API Keys |
| `PAYSTACK_PUBLIC_KEY` | Same as above |
| `TERMII_API_KEY` | termii.com → Dashboard → API Keys |
| `FRONTEND_URL` | Your frontend URL (e.g. https://payg.netlify.app) |

---

## API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/send-otp` | Send OTP to phone/email | None |
| POST | `/api/auth/verify-otp` | Verify OTP → return JWT | None |
| PUT | `/api/auth/profile` | Update profile after onboarding | ✅ JWT |
| GET | `/api/auth/me` | Get current user | ✅ JWT |

### Subscription
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/subscription` | Get user's subscription | ✅ JWT |
| POST | `/api/subscription/change` | Change plan | ✅ JWT |
| POST | `/api/subscription/cancel` | Cancel subscription | ✅ JWT |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/initialize` | Create pending transaction | ✅ JWT |
| POST | `/api/payments/verify` | Verify after Paystack callback | ✅ JWT |
| POST | `/api/payments/webhook` | Paystack webhook receiver | None (signature verified) |
| GET | `/api/payments` | Transaction history | ✅ JWT |

### Claims
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/claims` | List user's claims | ✅ JWT |
| POST | `/api/claims` | Submit new claim | ✅ JWT |
| GET | `/api/claims/:id` | Get single claim | ✅ JWT |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | List notifications | ✅ JWT |
| PUT | `/api/notifications/:id/read` | Mark one as read | ✅ JWT |
| PUT | `/api/notifications/read-all` | Mark all as read | ✅ JWT |

---

## Deploy to Render (Free)

1. Push the `health-insurance/backend` folder to a GitHub repo
2. Go to **render.com** → New → Web Service
3. Connect your repo
4. Set:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Environment**: Node
5. Add all environment variables from `.env.example`
6. Click **Deploy**

Your API will be live at: `https://payg-health-insurance-backend.onrender.com`

---

## Connect Frontend

In your frontend `.env`:
```
VITE_API_BASE_URL=https://payg-health-insurance-backend.onrender.com/api
```

Then uncomment all `api.*` calls in your React pages — they're already written in `src/utils/api.js`.

---

## Paystack Webhook Setup

After deploying to Render:
1. Go to **dashboard.paystack.com** → Settings → Webhooks
2. Add URL: `https://your-backend.onrender.com/api/payments/webhook`
3. Paystack will now send a server-side confirmation for every payment — more secure than relying only on the frontend callback.

---

## SMS in Development

In development mode, SMS messages are printed to the console instead of being sent. You'll also see `devOtp` in the `/send-otp` response so you can test without a real Termii key.

## Switching from Termii to Africa's Talking

See `utils/sms.js` — the Africa's Talking block is already written, just commented out with swap instructions.
