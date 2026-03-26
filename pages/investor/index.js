import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import RevenueChart from '../../components/RevenueChart'
import MonthTable from '../../components/MonthTable'

const NAV = [
  { href: '/investor', label: 'Dashboard', icon: '◉' },
]

const fmt = (n, currency) => currency === 'PKR'
  ? `PKR ${Number(n).toLocaleString()}`
  : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function InvestorDashboard() {
  const [user, setUser] = useState(null)
  const [months, setMonths] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [fiscalYear, setFiscalYear] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/investor/months').then(r => r.json()),
    ]).then(([u, m]) => {
      setUser(u)
      setMonths(Array.isArray(m) ? m : [])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  const fiscalYears = [...new Set(months.map(m => m.fiscalYear))].sort()
  const filtered = fiscalYear === 'all' ? months : months.filter(m => m.fiscalYear === fiscalYear)

  const totalIncome = filtered.reduce((s, m) => s + (currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome), 0)
  const totalMarketing = filtered.reduce((s, m) => s + (currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing), 0)
  const totalBalance = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.balancePKR : m.balance), 0)
  const totalShare = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)

  const received = filtered.filter(m => m.paymentStatus === 'Received')
  const pending = filtered.filter(m => m.paymentStatus === 'Pending')
  const totalReceived = received.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const totalPending = pending.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)

  const avgROI = filtered.length > 0
    ? filtered.reduce((s, m) => s + (m.balance / m.totalMarketing) * 100, 0) / filtered.length
    : 0

  const lastMonth = filtered[filtered.length - 1]
  const prevMonth = filtered[filtered.length - 2]
  const shareTrend = lastMonth && prevMonth
    ? ((lastMonth.investorShare - prevMonth.investorShare) / prevMonth.investorShare) * 100
    : undefined

  return (
    <>
      <Head><title>Investor Dashboard — Viral Mobitech</title></Head>
      <Layout user={user} investorLinks={NAV} adminLinks={NAV}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Your investment performance at a glance
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Fiscal Year Filter */}
            <select
              value={fiscalYear}
              onChange={e => setFiscalYear(e.target.value)}
              className="input text-sm py-1.5 w-auto pr-8"
              style={{ width: 'auto' }}>
              <option value="all">All Years</option>
              {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
            </select>
            {/* Currency Toggle */}
            <div className="flex rounded-lg border overflow-hidden text-sm" style={{ borderColor: 'var(--border)' }}>
              {['USD', 'PKR'].map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 font-medium transition-all duration-200 ${
                    currency === c ? 'text-yellow-900' : ''
                  }`}
                  style={currency === c
                    ? { background: 'linear-gradient(135deg, #d4a853, #f0d080)' }
                    : { background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Income"
            value={fmt(totalIncome, currency)}
            sub={`${filtered.length} months`}
            icon="📈"
          />
          <StatCard
            label="Net Balance"
            value={fmt(totalBalance, currency)}
            sub="After all costs"
            icon="⚖️"
          />
          <StatCard
            label="Your Total Share"
            value={fmt(totalShare, currency)}
            sub="30% of net balance"
            icon="💰"
            accent
            trend={shareTrend}
          />
          <StatCard
            label="Avg Monthly ROI"
            value={`${avgROI.toFixed(1)}%`}
            sub="Return on marketing"
            icon="📊"
          />
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="card flex items-center justify-between">
            <div>
              <p className="label">Received</p>
              <p className="text-xl font-bold font-display text-emerald-400">{fmt(totalReceived, currency)}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{received.length} months paid</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-emerald-900/20">
              ✓
            </div>
          </div>
          <div className="card flex items-center justify-between">
            <div>
              <p className="label">Pending</p>
              <p className="text-xl font-bold font-display text-amber-400">
                {totalPending > 0 ? fmt(totalPending, currency) : '—'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {pending.length > 0 ? `${pending.length} month${pending.length > 1 ? 's' : ''} pending` : 'All payments received'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-amber-900/20">
              ⏳
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card mb-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
            Revenue Overview
          </h2>
          {filtered.length > 0
            ? <RevenueChart months={filtered} currency={currency} />
            : <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No data for selected period</p>}
        </div>

        {/* Monthly Table */}
        <div className="card">
          <MonthTable months={filtered} currency={currency} isAdmin={false} />
        </div>
      </Layout>
    </>
  )
}
