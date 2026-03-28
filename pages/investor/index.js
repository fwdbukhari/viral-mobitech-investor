import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import RevenueChart from '../../components/RevenueChart'
import MonthTable from '../../components/MonthTable'
import { useTheme } from '../../lib/theme'

// No nav links for investor — removes "Dashboard" button from header
const NAV = []

const fmt = (n, currency) => currency === 'PKR'
  ? `PKR ${Number(n).toLocaleString()}`
  : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function CurrencyToggle({ currency, setCurrency, c }) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${c.cardBorder}` }}>
      {['USD', 'PKR'].map(cur => (
        <button key={cur} onClick={() => setCurrency(cur)}
          style={{
            padding: '7px 18px', fontFamily: 'Orbitron, monospace', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: 1, border: 'none', cursor: 'pointer',
            background: currency === cur ? 'linear-gradient(135deg, #1e6fff, #00c8ff)' : c.cardBg,
            color: currency === cur ? '#fff' : c.textMuted,
            transition: '0.2s ease',
          }}>
          {cur}
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
  const [sharePercent, setSharePercent] = useState(30) // Fix 3: track actual share %
  const { c } = useTheme()
  const [showGraph, setShowGraph] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/investor/months').then(r => r.json()),
    ]).then(([u, m]) => {
      setUser(u)
      const months = Array.isArray(m) ? m : []
      setMonths(months)
      // Get actual share % from first month returned by API
      if (months.length > 0 && months[0].sharePercent) {
        setSharePercent(months[0].sharePercent)
      }
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${c.cardBorder}`, borderTopColor: c.cyan, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', color: c.textMuted, letterSpacing: 1 }}>Loading dashboard…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const fiscalYears = [...new Set(months.map(m => m.fiscalYear))].sort()
  const filtered = fiscalYear === 'all' ? months : months.filter(m => m.fiscalYear === fiscalYear)
  const totalBalance = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.balancePKR : m.balance), 0)
  const totalShare = filtered.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const totalIncome = filtered.reduce((s, m) => s + (currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome), 0)
  const validForROI = filtered.filter(m => m.totalMarketing > 0)
  const avgROI = validForROI.length > 0 ? validForROI.reduce((s, m) => s + (m.balance / m.totalMarketing) * 100, 0) / validForROI.length : 0
  const received = filtered.filter(m => m.paymentStatus === 'Received')
  const pending = filtered.filter(m => m.paymentStatus === 'Pending')
  const totalReceived = received.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const totalPending = pending.reduce((s, m) => s + (currency === 'PKR' ? m.investorSharePKR : m.investorShare), 0)
  const last = filtered[filtered.length - 1], prev = filtered[filtered.length - 2]
  const shareTrend = last && prev ? ((last.investorShare - prev.investorShare) / prev.investorShare) * 100 : undefined

  return (
    <>
      <Head><title>Dashboard — VM Hub</title></Head>
      {/* Fix 1: NAV=[] removes Dashboard button */}
      <Layout user={user} investorLinks={NAV} adminLinks={NAV}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: 8 }}>VM Hub</div>
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.35rem', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
              Welcome back, <span style={{ color: c.cyan }}>{user?.name}</span>
            </h1>
            <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.82rem', color: c.textMuted, marginTop: 5 }}>
              Your investment performance at a glance
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value)}
              className="input" style={{ width: 'auto', minWidth: 130, padding: '7px 12px', fontSize: '0.82rem' }}>
              <option value="all">All Years</option>
              {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
            </select>
            <CurrencyToggle currency={currency} setCurrency={setCurrency} c={c} />
          </div>
        </div>

        {/* Stats — Fix 2: trend badge now compact/inline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 18 }}>
          <StatCard label="Total Income" value={fmt(totalIncome, currency)} sub={`${filtered.length} months`} icon="📈" />
          <StatCard label="Net Balance" value={fmt(totalBalance, currency)} sub="After all costs" icon="⚖️" />
          {/* Fix 2 + 3: accent with correct share % in sub */}
          <StatCard
            label="Your Total Share"
            value={fmt(totalShare, currency)}
            sub={`${sharePercent}% of net balance`}
            icon="💰"
            accent
            trend={shareTrend}
          />
          <StatCard label="Avg Monthly ROI" value={`${avgROI.toFixed(1)}%`} sub="Return on marketing" icon="📊" />
        </div>

        {/* Payment summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 18 }}>
          {[
            { label: 'Received', val: totalReceived, color: c.green, bg: `${c.green}18`, border: `${c.green}30`, icon: '✓', sub: `${received.length} months paid` },
            { label: 'Pending', val: totalPending, color: c.amber, bg: `${c.amber}18`, border: `${c.amber}30`, icon: '⏳', sub: pending.length > 0 ? `${pending.length} month${pending.length > 1 ? 's' : ''} pending` : 'All payments received' },
          ].map(({ label, val, color, bg, border, icon, sub }) => (
            <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: c.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.35rem', fontWeight: 700, color, margin: 0 }}>
                  {val > 0 ? fmt(val, currency) : '—'}
                </p>
                <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.75rem', color: c.textMuted, marginTop: 5 }}>{sub}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: bg, border: `1px solid ${border}`, flexShrink: 0 }}>
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showGraph ? 16 : 0 }}>
            <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', color: c.textMuted, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>Revenue Overview</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.78rem', color: c.textMuted }}>Show graph</span>
              <div onClick={() => setShowGraph(!showGraph)}
                style={{
                  width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                  background: showGraph ? 'linear-gradient(135deg, #1e6fff, #00c8ff)' : (c.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'),
                  position: 'relative', transition: '0.25s ease',
                  boxShadow: showGraph ? '0 0 10px rgba(0,200,255,0.35)' : 'none',
                }}>
                <div style={{
                  position: 'absolute', top: 2, left: showGraph ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: '0.25s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </label>
          </div>
          {showGraph && (filtered.length > 0
            ? <RevenueChart months={filtered} currency={currency} />
            : <p style={{ textAlign: 'center', color: c.textMuted, padding: '40px 0', fontFamily: 'Exo 2, sans-serif' }}>No data for selected period</p>)}
        </div>

        {/* Table — Fix 3: pass sharePercent so column header shows correct % */}
        <div className="card">
          <MonthTable months={filtered} currency={currency} isAdmin={false} sharePercent={sharePercent} />
        </div>
      </Layout>
    </>
  )
}
