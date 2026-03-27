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

function CurrencyToggle({ currency, setCurrency }) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,200,255,0.2)' }}>
      {['USD', 'PKR'].map(c => (
        <button key={c} onClick={() => setCurrency(c)}
          style={{
            padding: '7px 18px', fontFamily: 'Orbitron, monospace', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: 1, border: 'none', cursor: 'pointer',
            background: currency === c ? 'linear-gradient(135deg, #1e6fff, #00c8ff)' : 'rgba(7,21,69,0.6)',
            color: currency === c ? '#fff' : '#6a9abf',
            boxShadow: currency === c ? '0 0 16px rgba(0,200,255,0.3)' : 'none',
            transition: '0.2s ease',
          }}>
          {c}
        </button>
      ))}
    </div>
  )
}

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(0,200,255,0.2)', borderTopColor: '#00c8ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', color: '#6a9abf', letterSpacing: 1 }}>Loading dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

        {/* Page Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Admin Overview
            </h1>
            <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.82rem', color: '#6a9abf', marginTop: 5 }}>
              {months.length} months of data — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value)}
              className="input" style={{ width: 'auto', minWidth: 130, padding: '7px 12px', fontSize: '0.82rem' }}>
              <option value="all">All Years</option>
              {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
            </select>
            <CurrencyToggle currency={currency} setCurrency={setCurrency} />
          </div>
        </div>

        {/* Empty state */}
        {months.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📊</p>
            <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem', color: '#ffffff', marginBottom: 6 }}>No data yet</p>
            <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', color: '#6a9abf', marginBottom: 20 }}>
              Seed historical data or add a new month to get started
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-filled btn-vm" onClick={async () => {
                const res = await fetch('/api/admin/seed', { method: 'POST' })
                const d = await res.json()
                if (d.ok) window.location.reload()
                else alert('Seed failed: ' + d.error)
              }}>
                ⚡ Seed Historical Data
              </button>
              <Link href="/admin/entry" className="btn-ghost btn-vm">+ Add Month</Link>
            </div>
          </div>
        )}

        {months.length > 0 && (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
              <StatCard label="Total Revenue" value={fmt(totalIncome, currency)} sub={`${filtered.length} months`} icon="📈" />
              <StatCard label="Total Marketing" value={fmt(totalMarketing, currency)} sub="Ads + Taxes + AIT" icon="📣" />
              <StatCard label="Net Balance" value={fmt(totalBalance, currency)} sub="After all deductions" icon="⚖️" accent />
              <StatCard label="Avg ROI" value={`${avgROI.toFixed(1)}%`} sub="Return on marketing spend" icon="📊" />
            </div>

            {/* Investor payout summary */}
            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
              <div>
                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: '#6a9abf', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                  Total Investor Payouts (30%)
                </p>
                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.6rem', fontWeight: 700, color: '#00c8ff', textShadow: '0 0 20px rgba(0,200,255,0.4)', margin: 0 }}>
                  {fmt(totalShare, currency)}
                </p>
                <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.78rem', color: '#6a9abf', marginTop: 5 }}>
                  {filtered.filter(m => m.paymentStatus === 'Received').length} received ·{' '}
                  {filtered.filter(m => m.paymentStatus === 'Pending').length} pending
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/admin/entry" className="btn-filled btn-vm" style={{ fontSize: '0.82rem', padding: '9px 20px' }}>
                  + New Month
                </Link>
                <Link href="/admin/investors" className="btn-ghost btn-vm" style={{ fontSize: '0.82rem', padding: '9px 20px' }}>
                  Manage Investors
                </Link>
              </div>
            </div>

            {/* Chart */}
            <div className="card" style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', color: '#6a9abf', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                Revenue Overview
              </p>
              <RevenueChart months={filtered} currency={currency} />
            </div>

            {/* Monthly table */}
            <div className="card">
              <MonthTable months={filtered} currency={currency} isAdmin onStatusChange={handleStatusChange} />
            </div>
          </>
        )}
      </Layout>
    </>
  )
}
