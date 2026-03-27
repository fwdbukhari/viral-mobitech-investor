import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import RevenueChart from '../../components/RevenueChart'
import MonthTable from '../../components/MonthTable'

const NAV = [{ href: '/investor', label: 'Dashboard', icon: '◉' }]

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
            transition: '0.2s ease',
          }}>
          {c}
        </button>
      ))}
    </div>
  )
}

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

  const totalBalance = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.balancePKR : m.balance), 0)
  const totalShare = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const totalIncome = filtered.reduce((s, m) => s + (currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome), 0)
  const avgROI = filtered.length > 0
    ? filtered.reduce((s, m) => s + (m.balance / m.totalMarketing) * 100, 0) / filtered.length
    : 0

  const received = filtered.filter(m => m.paymentStatus === 'Received')
  const pending = filtered.filter(m => m.paymentStatus === 'Pending')
  const totalReceived = received.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const totalPending = pending.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)

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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: 8 }}>Investor Portal</div>
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Welcome back, <span style={{ color: '#00c8ff' }}>{user?.name}</span>
            </h1>
            <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.82rem', color: '#6a9abf', marginTop: 5 }}>
              Your investment performance at a glance
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

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
          <StatCard label="Total Income" value={fmt(totalIncome, currency)} sub={`${filtered.length} months`} icon="📈" />
          <StatCard label="Net Balance" value={fmt(totalBalance, currency)} sub="After all costs" icon="⚖️" />
          <StatCard label="Your Total Share" value={fmt(totalShare, currency)} sub="30% of net balance" icon="💰" accent trend={shareTrend} />
          <StatCard label="Avg Monthly ROI" value={`${avgROI.toFixed(1)}%`} sub="Return on marketing" icon="📊" />
        </div>

        {/* Payment summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
          {/* Received */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: '#6a9abf', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Received</p>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.35rem', fontWeight: 700, color: '#34d399', margin: 0 }}>
                {fmt(totalReceived, currency)}
              </p>
              <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.75rem', color: '#6a9abf', marginTop: 5 }}>
                {received.length} months paid
              </p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              ✓
            </div>
          </div>
          {/* Pending */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: '#6a9abf', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Pending</p>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.35rem', fontWeight: 700, color: '#fbbf24', margin: 0 }}>
                {totalPending > 0 ? fmt(totalPending, currency) : '—'}
              </p>
              <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.75rem', color: '#6a9abf', marginTop: 5 }}>
                {pending.length > 0 ? `${pending.length} month${pending.length > 1 ? 's' : ''} pending` : 'All payments received'}
              </p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
              ⏳
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card" style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', color: '#6a9abf', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            Revenue Overview
          </p>
          {filtered.length > 0
            ? <RevenueChart months={filtered} currency={currency} />
            : <p style={{ textAlign: 'center', color: '#6a9abf', padding: '40px 0', fontFamily: 'Exo 2, sans-serif' }}>No data for selected period</p>}
        </div>

        {/* Table */}
        <div className="card">
          <MonthTable months={filtered} currency={currency} isAdmin={false} />
        </div>
      </Layout>
    </>
  )
}
