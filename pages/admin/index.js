import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import RevenueChart from '../../components/RevenueChart'
import MonthTable from '../../components/MonthTable'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◉' },
  { href: '/admin/entry', label: 'Data Entry', icon: '✏️' },
  { href: '/admin/investors', label: 'Investors', icon: '👥' },
]

const fmt = (n, currency) => currency === 'PKR'
  ? `PKR ${Number(n).toLocaleString()}`
  : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [months, setMonths] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [fiscalYear, setFiscalYear] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/admin/months').then(r => r.json()),
    ]).then(([u, m]) => {
      setUser(u)
      setMonths(Array.isArray(m) ? m : [])
      setLoading(false)
    })
  }, [])

  async function handleStatusChange(monthId, newStatus) {
    const m = months.find(x => x.id === monthId)
    if (!m) return
    const res = await fetch(`/api/admin/months/${monthId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...m, paymentStatus: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMonths(prev => prev.map(x => x.id === monthId ? updated : x))
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    </div>
  )

  const fiscalYears = [...new Set(months.map(m => m.fiscalYear))].sort()
  const filtered = fiscalYear === 'all' ? months : months.filter(m => m.fiscalYear === fiscalYear)

  const totalIncome = filtered.reduce((s, m) => s + (currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome), 0)
  const totalMarketing = filtered.reduce((s, m) => s + (currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing), 0)
  const totalBalance = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.balancePKR : m.balance), 0)
  const totalShare = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const avgROI = filtered.length > 0
    ? filtered.reduce((s, m) => s + (m.balance / m.totalMarketing) * 100, 0) / filtered.length
    : 0

  return (
    <>
      <Head><title>Admin Overview — Viral Mobitech</title></Head>
      <Layout user={user} adminLinks={NAV} investorLinks={NAV}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Admin Overview
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {months.length} months of data — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value)}
              className="input text-sm py-1.5" style={{ width: 'auto' }}>
              <option value="all">All Years</option>
              {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
            </select>
            <div className="flex rounded-lg border overflow-hidden text-sm" style={{ borderColor: 'var(--border)' }}>
              {['USD', 'PKR'].map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 font-medium transition-all duration-200 ${currency === c ? 'text-yellow-900' : ''}`}
                  style={currency === c
                    ? { background: 'linear-gradient(135deg, #d4a853, #f0d080)' }
                    : { background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions if no data */}
        {months.length === 0 && (
          <div className="card mb-6 text-center py-10">
            <p className="text-3xl mb-3">📊</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No data yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Seed historical data or add a new month to get started</p>
            <div className="flex items-center justify-center gap-3">
              <button className="btn-gold" onClick={async () => {
                const res = await fetch('/api/admin/seed', { method: 'POST' })
                const d = await res.json()
                if (d.ok) window.location.reload()
                else alert('Seed failed: ' + d.error)
              }}>
                ⚡ Seed Historical Data
              </button>
              <Link href="/admin/entry" className="btn-ghost">+ Add Month</Link>
            </div>
          </div>
        )}

        {months.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Revenue" value={fmt(totalIncome, currency)} sub={`${filtered.length} months`} icon="📈" />
              <StatCard label="Total Marketing" value={fmt(totalMarketing, currency)} sub="Ads + Taxes + AIT" icon="📣" />
              <StatCard label="Net Balance" value={fmt(totalBalance, currency)} sub="After all deductions" icon="⚖️" accent />
              <StatCard label="Avg ROI" value={`${avgROI.toFixed(1)}%`} sub="Return on marketing spend" icon="📊" />
            </div>

            {/* Investor payout summary */}
            <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="label">Total Investor Payouts (30%)</p>
                <p className="text-2xl font-bold font-display gold-text">{fmt(totalShare, currency)}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {filtered.filter(m => m.paymentStatus === 'Received').length} received ·{' '}
                  {filtered.filter(m => m.paymentStatus === 'Pending').length} pending
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/entry" className="btn-gold text-sm">+ New Month</Link>
                <Link href="/admin/investors" className="btn-ghost text-sm">Manage Investors</Link>
              </div>
            </div>

            {/* Chart */}
            <div className="card mb-6">
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Revenue Overview</h2>
              <RevenueChart months={filtered} currency={currency} />
            </div>

            {/* Table */}
            <div className="card">
              <MonthTable months={filtered} currency={currency} isAdmin onStatusChange={handleStatusChange} />
            </div>
          </>
        )}
      </Layout>
    </>
  )
}
