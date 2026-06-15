import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const Ctx = createContext(null)

// --- defaults ---
const MOCK_USER = null

const DEFAULT_SUB = {
  id: 'sub_001',
  plan: 'Standard',
  planId: 2,
  status: 'active',
  coverageUntil: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  walletBalance: 350,
  planPrice: 1000,
  policyNumber: 'PAYG-2026-004821',
  nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  insuranceType: 'health', // 'health' | 'life'
}

const MOCK_TRANSACTIONS = []
const MOCK_NOTIFICATIONS = []
const MOCK_CLAIMS = []

// --- helpers ---
const load = (key, fallback) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }) {
  // ---------------- STATE ----------------
  const [user, setUser] = useState(MOCK_USER)

  const [subscription, setSubscription] = useState(() =>
    load('subscription', DEFAULT_SUB)
  )

  const [transactions, setTransactions] = useState(() =>
    load('transactions', MOCK_TRANSACTIONS)
  )

  const [notifications, setNotifications] = useState(() =>
    load('notifications', MOCK_NOTIFICATIONS)
  )

  const [claims, setClaims] = useState(() =>
    load('claims', MOCK_CLAIMS)
  )

  // ---------------- PERSISTENCE ----------------
  useEffect(() => {
    localStorage.setItem('subscription', JSON.stringify(subscription))
  }, [subscription])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('claims', JSON.stringify(claims))
  }, [claims])

  // ---------------- AUTH ----------------
  const login = useCallback((userData) => {
    if (!userData || typeof userData !== 'object') return
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    setUser(null)

    // remove only app-related data
    localStorage.removeItem('subscription')
    localStorage.removeItem('transactions')
    localStorage.removeItem('notifications')
    localStorage.removeItem('claims')
  }, [])

  const updateUser = useCallback((data) => {
    if (!data || typeof data !== 'object') return

    setUser(prev => ({
      ...(prev || {}),
      ...data,
    }))
  }, [])

  // ---------------- PAYMENTS ----------------
  const addPayment = useCallback((amount, reference) => {
    const value = Number(amount)
    if (!value || value <= 0) return

    setSubscription(prev => {
      const newBalance = Number(prev.walletBalance) + value
      const cappedBalance = Math.min(newBalance, prev.planPrice)

      return {
        ...prev,
        walletBalance: cappedBalance,
        status: cappedBalance >= prev.planPrice ? 'active' : prev.status,
      }
    })

    const now = new Date().toISOString()

    setTransactions(prev => [
      {
        id: `t${Date.now()}`,
        amount: value,
        type: 'Payment',
        date: now,
        status: 'success',
        reference,
      },
      ...prev
    ])

    setNotifications(prev => [
      {
        id: `n${Date.now()}`,
        type: 'payment',
        title: 'Payment received',
        body: `₦${value.toLocaleString()} added to your wallet.`,
        time: now,
        read: false,
      },
      ...prev
    ])
  }, [])

  // ---------------- PLANS ----------------
  const changePlan = useCallback((planId, planName, planPrice) => {
    if (!planId || !planPrice) return

    setSubscription(prev => ({
      ...prev,
      planId,
      plan: planName,
      planPrice,
      walletBalance: 0,
      status: 'pending',
    }))
  }, [])

  const cancelSubscription = useCallback(() => {
    setSubscription(prev => ({
      ...prev,
      status: 'inactive'
    }))
  }, [])

  const changeInsuranceType = useCallback((type) => {
    if (type !== 'health' && type !== 'life') return
    setSubscription(prev => ({
      ...prev,
      insuranceType: type,
      // Reset plan selection when switching type
      plan: 'Standard',
      planId: 2,
      planPrice: type === 'health' ? 1000 : 1500,
      walletBalance: 0,
      status: 'pending',
    }))
  }, [])

  // ---------------- CLAIMS ----------------
  const submitClaim = useCallback((claimData) => {
    if (!claimData || typeof claimData !== 'object') return null

    const newClaim = {
      id: `c${Date.now()}`,
      ref: `CLM-2026-${String(Date.now()).slice(-4)}`,
      status: 'submitted',
      date: new Date().toISOString(),
      ...claimData,
    }

    setClaims(prev => [newClaim, ...prev])

    return newClaim
  }, [])

  // ---------------- NOTIFICATIONS ----------------
  const markRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  // ---------------- EXPORT ----------------
  return (
    <Ctx.Provider value={{
      // auth
      user,
      login,
      logout,
      updateUser,

      // subscription
      subscription,
      setSubscription,
      changePlan,
      cancelSubscription,
      changeInsuranceType,

      // payments
      addPayment,
      transactions,

      // notifications
      notifications,
      markRead,
      markAllRead,
      unreadCount,

      // claims
      claims,
      submitClaim,
    }}>
      {children}
    </Ctx.Provider>
  )
}

// ---------------- HOOK ----------------
export const useApp = () => useContext(Ctx)