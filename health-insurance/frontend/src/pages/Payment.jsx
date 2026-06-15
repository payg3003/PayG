import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { usePaystack } from '../hooks/usePaystack.js'
import AppLayout from '../components/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'

const QUICK_AMOUNTS = [200, 500, 1000, 2000]
const AIRTIME_PERCENTAGES = [
  { value: 10, label: '10%', desc: 'Light deduction', color: 'bg-[#161B22] text-[#2DD4BF] border-[#30363D] hover:border-[#2DD4BF]' },
  { value: 20, label: '20%', desc: 'Balanced', color: 'bg-[#161B22] text-[#2DD4BF] border-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.15)]', recommended: true },
  { value: 50, label: '50%', desc: 'Fast coverage', color: 'bg-[#161B22] text-[#2DD4BF] border-[#30363D] hover:border-[#2DD4BF]' },
]
const NETWORKS = [
  { id: 'MTN',     emoji: '🟡', color: 'border-[#30363D] bg-[#21262D] hover:border-[#2DD4BF]' },
  { id: 'Airtel',  emoji: '🔴', color: 'border-[#30363D] bg-[#21262D] hover:border-[#2DD4BF]' },
  { id: 'Glo',     emoji: '🟢', color: 'border-[#30363D] bg-[#21262D] hover:border-[#2DD4BF]' },
  { id: '9mobile', emoji: '🟩', color: 'border-[#30363D] bg-[#21262D] hover:border-[#2DD4BF]' },
]

const MONTHLY_AIRTIME_ESTIMATE = 3000

export default function Payment() {
  const { subscription, addPayment, user, updateAirtimeSettings } = useApp()
  const { openPaystack } = usePaystack()
  const navigate = useNavigate()

  // Payment tab: 'manual' | 'airtime'
  const [tab,     setTab]     = useState('manual')
  const [amount,  setAmount]  = useState('')
  const [method,  setMethod]  = useState('paystack')
  const [stage,   setStage]   = useState('form')
  const [error,   setError]   = useState('')
  const [paidRef, setPaidRef] = useState(null)

  // Airtime deduction state
  const existing = subscription.airtimeDeduction || {}
  const [airPct,      setAirPct]      = useState(existing.percentage || null)
  const [airNetwork,  setAirNetwork]  = useState(existing.network || null)
  const [airSaved,    setAirSaved]    = useState(false)
  const [airError,    setAirError]    = useState('')

  const remaining = Math.max(0, subscription.planPrice - subscription.walletBalance)
  const progress  = Math.min((subscription.walletBalance / subscription.planPrice) * 100, 100)

  const estimatedMonthly = airPct ? Math.round(MONTHLY_AIRTIME_ESTIMATE * airPct / 100) : 0
  const monthsToFull     = airPct ? Math.ceil(subscription.planPrice / estimatedMonthly) : null

  // ── Manual payment ────────────────────────────────────────────────────────
  const handlePay = () => {
    const amt = parseInt(amount)
    if (!amt || amt < 100) { setError('Minimum payment is ₦100'); return }
    setError('')
    setStage('processing')
    openPaystack({
      email: user?.email || 'user@payg.ng',
      amount: amt,
      reference: `PAYG_${Date.now()}`,
      onSuccess: (response) => {
        addPayment(amt, response.reference)
        setPaidRef(response.reference)
        setStage('success')
      },
      onClose: () => { setStage('form'); setError('Payment was cancelled. Try again.') },
    })
  }

  // ── Save airtime settings ─────────────────────────────────────────────────
  const handleSaveAirtime = () => {
    if (!airPct) { setAirError('Select a deduction percentage'); return }
    if (!airNetwork) { setAirError('Select your network'); return }
    setAirError('')
    updateAirtimeSettings({ enabled: true, percentage: airPct, network: airNetwork })
    setAirSaved(true)
    setTimeout(() => setAirSaved(false), 3000)
  }

  const handleDisableAirtime = () => {
    updateAirtimeSettings({ enabled: false, percentage: null, network: null })
    setAirPct(null)
    setAirNetwork(null)
  }

  // ── Processing screen ─────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center px-5 text-[#F0F6FC]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#161B22] border border-[#30363D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
            <span className="w-10 h-10 border-4 border-[#21262D] border-t-[#2DD4BF] rounded-full animate-spin block"/>
          </div>
          <h2 className="font-display font-extrabold text-2xl mb-2">Opening Paystack…</h2>
          <p className="text-[#8B949E] text-sm">Secure payment gateway is loading</p>
        </div>
      </div>
    )
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (stage === 'success') {
    const amt = parseInt(amount)
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center px-5 text-[#F0F6FC]">
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-24 h-24 bg-[#161B22] border border-[#2DD4BF]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(45,212,191,0.15)]">
            <span className="icon text-[#2DD4BF] text-5xl">check_circle</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl mb-1">Payment Successful!</h2>
          <p className="text-[#8B949E] text-sm mb-6">₦{amt.toLocaleString()} added to your insurance wallet</p>
          
          <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 mb-5 text-left space-y-3">
            {[
              ['Amount',      `₦${amt.toLocaleString()}`],
              ['Reference',   paidRef],
              ['New Balance', `₦${subscription.walletBalance.toLocaleString()}`],
              ['Status',      'Confirmed'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-[#8B949E] font-display">{l}</span>
                <span className="font-display font-bold text-[#F0F6FC] text-xs md:text-sm">{v}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#161B22] border border-[#2DD4BF]/20 rounded-2xl p-4 mb-6 flex gap-3 items-start text-left">
            <span className="icon text-[#2DD4BF] text-xl flex-shrink-0">sms</span>
            <div>
              <p className="text-xs font-display font-bold text-[#2DD4BF] mb-1">SMS Sent ✓</p>
              <p className="text-xs text-[#8B949E] italic leading-relaxed">
                "₦{amt.toLocaleString()} received. Your PAYG coverage is active. Stay healthy! 🛡️"
              </p>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] text-[#0D1117] font-display font-bold py-4 rounded-3xl shadow-[0_4px_20px_rgba(45,212,191,0.25)] hover:opacity-90 active:scale-95 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <>
      <AppLayout>
        <div className="pb-28 md:pb-8 md:pt-20 text-[#F0F6FC] bg-[#0D1117] min-h-screen">
          <PageHeader title="Top Up Wallet" subtitle="Fund your insurance wallet"/>

          <div className="px-4 md:px-6 pt-4 flex flex-col gap-4">

            {/* Wallet balance card */}
            <div className="bg-gradient-to-br from-[#161B22] to-[#0D1117] border border-[#30363D] rounded-4xl p-5 md:p-7 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DD4BF]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"/>
              <p className="text-[#8B949E] text-xs font-display font-semibold mb-1">Insurance Wallet</p>
              <p className="font-display font-black text-[#F0F6FC] text-3xl mb-3">
                ₦{subscription.walletBalance.toLocaleString()}
              </p>
              
              <div className="w-full h-1.5 bg-[#21262D] rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
              </div>

              <div className="flex items-center justify-between">
                {remaining > 0
                  ? <p className="text-[#8B949E] text-xs font-display">
                      ₦{remaining.toLocaleString()} more for full{' '}
                      <span className="text-[#2DD4BF] font-bold">{subscription.plan}</span> coverage
                    </p>
                  : <p className="text-[#2DD4BF] text-xs font-display font-bold">🎉 Fully funded this month!</p>}
                
                {subscription.airtimeDeduction?.enabled && (
                  <div className="flex items-center gap-1 bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 px-2 py-1 rounded-full">
                    <span className="icon text-[#2DD4BF] text-sm">sim_card</span>
                    <p className="text-[#2DD4BF] text-[10px] font-display font-bold">
                      {subscription.airtimeDeduction.percentage}% airtime active
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-[#161B22] border border-[#30363D] rounded-2xl p-1">
              {[
                ['manual',  'payments',  'Pay Now'],
                ['airtime', 'sim_card',  'Airtime Deduction'],
              ].map(([t, ic, lb]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                    tab === t 
                      ? 'bg-[#21262D] text-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.1)] border border-[#30363D]' 
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}>
                  <span className={`text-lg ${tab === t ? 'icon text-[#2DD4BF]' : 'icon-o'}`}>{ic}</span>
                  {lb}
                </button>
              ))}
            </div>

            {/* ── TAB: Manual payment ──────────────────────────────────────── */}
            {tab === 'manual' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Amount selector */}
                  <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 shadow-card">
                    <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-3">
                      Quick Add
                    </p>
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {QUICK_AMOUNTS.map(a => (
                        <button key={a} onClick={() => { setAmount(String(a)); setError('') }}
                          className={`py-3 rounded-2xl font-display font-bold text-sm transition-all relative border ${
                            amount === String(a)
                              ? 'bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] text-[#0D1117] border-transparent shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                              : 'bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:border-[#2DD4BF] hover:text-[#2DD4BF]'
                          }`}>
                          {a === remaining && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-[#0D9488] text-[#F0F6FC] px-1.5 rounded-full font-display font-bold whitespace-nowrap">
                              Exact
                            </span>
                          )}
                          ₦{a >= 1000 ? `${a/1000}k` : a}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                      Custom Amount
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-bold text-[#8B949E] text-lg">₦</span>
                      <input type="number" value={amount} min={100}
                        onChange={e => { setAmount(e.target.value); setError('') }}
                        placeholder="Enter amount (min ₦100)"
                        className={`w-full bg-[#21262D] border-2 rounded-2xl h-13 pl-9 pr-4 py-3.5 font-display font-bold text-lg text-[#F0F6FC] transition-all outline-none ${
                          error ? 'border-red-500/50 focus:border-red-500' : 'border-[#30363D] focus:border-[#2DD4BF]'
                        }`}/>
                    </div>
                    {error && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <span className="icon-o text-sm">error</span>{error}
                      </p>
                    )}
                  </div>

                  {/* Payment method */}
                  <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 shadow-card">
                    <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-3">
                      Payment Method
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { id:'paystack',    label:'Paystack',    sub:'Card, bank transfer, USSD',    emoji:'💳', badge:'Recommended' },
                        { id:'flutterwave', label:'Flutterwave', sub:'Card, mobile money, transfer', emoji:'🌍', badge: null },
                      ].map(m => (
                        <button key={m.id} onClick={() => setMethod(m.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            method === m.id 
                              ? 'border-[#2DD4BF] bg-[#21262D] shadow-[0_0_15px_rgba(45,212,191,0.05)]' 
                              : 'border-[#30363D] bg-[#161B22] hover:border-[#2DD4BF]/50'
                          }`}>
                          <span className="text-2xl">{m.emoji}</span>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-display font-bold text-[#F0F6FC] text-sm">{m.label}</p>
                              {m.badge && (
                                <span className="text-[9px] bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] font-display font-bold px-1.5 py-0.5 rounded-full">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8B949E]">{m.sub}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            method === m.id ? 'border-[#2DD4BF]' : 'border-[#30363D]'
                          }`}>
                            {method === m.id && <div className="w-2.5 h-2.5 bg-[#2DD4BF] rounded-full"/>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-5 my-2">
                  {[["lock","SSL Secure"],["verified_user","PCI-DSS"],["support_agent","24/7 Support"]].map(([ic,lb]) => (
                    <div key={lb} className="flex items-center gap-1 text-[10px] text-[#8B949E] font-display">
                      <span className="icon-o text-sm text-[#2DD4BF]">{ic}</span> {lb}
                    </div>
                  ))}
                </div>

                <button onClick={handlePay}
                  className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] text-[#0D1117] font-display font-bold py-4 rounded-3xl shadow-[0_4px_20px_rgba(45,212,191,0.2)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 text-base">
                  <span className="icon-o text-xl">payments</span>
                  Pay ₦{amount ? parseInt(amount).toLocaleString() : '---'} via {method === 'paystack' ? 'Paystack' : 'Flutterwave'}
                </button>
                <p className="text-center text-xs text-[#8B949E] pb-2">Secured by SSL. Your card details are never stored.</p>
              </>
            )}

            {/* ── TAB: Airtime deduction ───────────────────────────────────── */}
            {tab === 'airtime' && (
              <div className="flex flex-col gap-4">

                {/* Explainer */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex gap-3 items-start shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                  <span className="icon text-[#2DD4BF] text-xl flex-shrink-0 mt-0.5">sim_card</span>
                  <div>
                    <p className="font-display font-bold text-[#2DD4BF] text-sm mb-1">How airtime deduction works</p>
                    <p className="text-xs text-[#8B949E] leading-relaxed">
                      Every time you recharge your phone, a percentage of that airtime is automatically
                      converted to cash and added to your PAYG insurance wallet. No manual action needed.
                    </p>
                  </div>
                </div>

                {/* Current status if already enabled */}
                {subscription.airtimeDeduction?.enabled && (
                  <div className="bg-[#161B22] border border-[#2DD4BF]/20 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(45,212,191,0.05)]">
                    <div className="flex items-center gap-3">
                      <span className="icon text-[#2DD4BF] text-xl">check_circle</span>
                      <div>
                        <p className="font-display font-bold text-[#2DD4BF] text-sm">Airtime deduction active</p>
                        <p className="text-xs text-[#8B949E]">
                          {subscription.airtimeDeduction.percentage}% deducted on every {subscription.airtimeDeduction.network} recharge
                        </p>
                      </div>
                    </div>
                    <button onClick={handleDisableAirtime}
                      className="text-xs font-display font-bold text-red-400 hover:underline">
                      Disable
                    </button>
                  </div>
                )}

                {/* Step 1: Choose percentage */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] flex items-center justify-center text-[#0D1117] text-xs font-display font-bold flex-shrink-0">1</div>
                    <p className="font-display font-bold text-[#F0F6FC]">Choose deduction percentage</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {AIRTIME_PERCENTAGES.map(opt => (
                      <button key={opt.value} onClick={() => { setAirPct(opt.value); setAirError('') }}
                        className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${
                          airPct === opt.value
                            ? 'border-[#2DD4BF] bg-[#21262D] shadow-[0_0_15px_rgba(45,212,191,0.15)] scale-105'
                            : 'border-[#30363D] bg-[#21262D]/50 text-[#F0F6FC] hover:border-[#2DD4BF]/50'
                        }`}>
                        {opt.recommended && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] bg-[#0D9488] text-[#F0F6FC] px-2 py-0.5 rounded-full font-display font-bold whitespace-nowrap">
                            Popular
                          </span>
                        )}
                        <span className="font-display font-black text-2xl text-[#F0F6FC] mb-1">{opt.label}</span>
                        <span className="text-[10px] font-display text-[#8B949E] text-center leading-tight">{opt.desc}</span>
                        {airPct === opt.value && (
                          <span className="icon text-[#2DD4BF] text-lg mt-1">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Live preview */}
                  {airPct && (
                    <div className="mt-4 bg-[#21262D] border border-[#30363D] rounded-2xl p-4">
                      <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                        Estimated contribution
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-[#F0F6FC]">
                            ~₦{estimatedMonthly.toLocaleString()}<span className="text-[#8B949E] font-normal text-xs">/month</span>
                          </p>
                          <p className="text-xs text-[#8B949E]">
                            Based on ₦{MONTHLY_AIRTIME_ESTIMATE.toLocaleString()} avg monthly recharge
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-[#2DD4BF]">
                            {monthsToFull} month{monthsToFull !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-[#8B949E]">to full coverage</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full h-2 bg-[#161B22] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((estimatedMonthly / subscription.planPrice) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#8B949E] mt-1 font-display">
                          Covers {Math.min(Math.round((estimatedMonthly / subscription.planPrice) * 100), 100)}% of your ₦{subscription.planPrice.toLocaleString()} {subscription.plan} plan per month
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Choose network */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] flex items-center justify-center text-[#0D1117] text-xs font-display font-bold flex-shrink-0">2</div>
                    <p className="font-display font-bold text-[#F0F6FC]">Select your network</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {NETWORKS.map(n => (
                      <button key={n.id} onClick={() => { setAirNetwork(n.id); setAirError('') }}
                        className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${
                          airNetwork === n.id
                            ? 'border-[#2DD4BF] bg-[#21262D] scale-105 shadow-[0_0_15px_rgba(45,212,191,0.1)]'
                            : 'border-[#30363D] bg-[#21262D]/30 hover:border-[#2DD4BF]/50'
                        }`}>
                        <span className="text-xl">{n.emoji}</span>
                        <span className={`font-display font-bold text-sm ${airNetwork === n.id ? 'text-[#F0F6FC]' : 'text-[#8B949E]'}`}>
                          {n.id}
                        </span>
                        {airNetwork === n.id && (
                          <span className="icon text-[#2DD4BF] text-base ml-auto">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* How it's calculated */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 shadow-card">
                  <p className="font-display font-bold text-[#F0F6FC] text-sm mb-3">Example calculation</p>
                  <div className="space-y-2">
                    {[
                      ['You recharge',         '₦1,000'],
                      [`${airPct || 20}% deducted`, `₦${Math.round(1000 * (airPct || 20) / 100)}`],
                      ['Airtime remaining',    `₦${1000 - Math.round(1000 * (airPct || 20) / 100)}`],
                      ['Added to PAYG wallet', `₦${Math.round(1000 * (airPct || 20) / 100)}`],
                    ].map(([label, value], i) => (
                      <div key={label} className={`flex items-center justify-between py-2 ${i < 3 ? 'border-b border-[#30363D]' : ''}`}>
                        <p className={`text-sm font-display ${i === 3 ? 'font-bold text-[#2DD4BF]' : 'text-[#8B949E]'}`}>{label}</p>
                        <p className={`text-sm font-display font-bold ${i === 3 ? 'text-[#2DD4BF]' : 'text-[#F0F6FC]'}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {airError && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="icon-o text-base">error</span>{airError}
                  </p>
                )}

                {/* Important note */}
                <div className="bg-[#21262D] border border-[#30363D] rounded-2xl p-4 flex gap-2 items-start">
                  <span className="icon text-[#2DD4BF] text-lg flex-shrink-0 mt-0.5">info</span>
                  <p className="text-xs text-[#8B949E] font-display leading-relaxed">
                    Airtime deduction requires your network provider's integration. 
                    This feature is currently in <span className="font-black text-[#2DD4BF]">beta</span> — you'll receive an SMS when it's live on your network.
                  </p>
                </div>

                {/* Save button */}
                <button onClick={handleSaveAirtime}
                  className={`w-full font-display font-bold py-4 rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-2 text-base ${
                    airSaved
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-[#0D1117] shadow-[0_4px_15px_rgba(16,185,129,0.2)]'
                      : 'bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] text-[#0D1117] shadow-[0_4px_20px_rgba(45,212,191,0.2)] hover:opacity-90'
                  }`}>
                  {airSaved ? (
                    <><span className="icon">check_circle</span> Saved! You're set up.</>
                  ) : (
                    <><span className="icon-o">save</span>
                      {airPct && airNetwork
                        ? `Enable ${airPct}% deduction on ${airNetwork}`
                        : 'Save Airtime Settings'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  )
}