import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { useTheme } from '../../lib/theme'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◉' },
  { href: '/admin/entry', label: 'Data Entry', icon: '✏️' },
  { href: '/admin/investors', label: 'Investors', icon: '👥' },
]

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function getFiscalYear(year, month) {
  if (month >= 7) return `${year}-${year + 1}`
  return `${year - 1}-${year}`
}

export default function DataEntry() {
  const router = useRouter()
  const { c } = useTheme()
  const [user, setUser] = useState(null)
  const [existingMonths, setExistingMonths] = useState([])
  const [editId, setEditId] = useState('')
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    adsRevenue: '',
    subscriptions: '',
    adjInvalidTraffic: '',
    adsSpend: '',
    taxes: '',
    pkrRate: '283',
    aitInMarketing: false,
    paymentStatus: 'Pending',
    receiptUrl: '',
  })
  const [computed, setComputed] = useState(null)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/admin/months').then(r => r.json()),
    ]).then(([u, m]) => {
      setUser(u)
      setExistingMonths(Array.isArray(m) ? m : [])
    })
  }, [])

  // Load existing month for edit
  useEffect(() => {
    if (editId) {
      const m = existingMonths.find(x => x.id === editId)
      if (m) {
        const [yr, mn] = m.id.split('-').map(Number)
        setForm({
          year: yr, month: mn,
          adsRevenue: m.adsRevenue,
          subscriptions: m.subscriptions,
          adjInvalidTraffic: m.adjInvalidTraffic,
          adsSpend: m.adsSpend,
          taxes: m.taxes,
          pkrRate: m.pkrRate,
          aitInMarketing: m.aitInMarketing,
          paymentStatus: m.paymentStatus,
          receiptUrl: m.receiptUrl || '',
        })
      }
    }
  }, [editId, existingMonths])

  // Live compute preview
  useEffect(() => {
    const ads = parseFloat(form.adsRevenue) || 0
    const subs = parseFloat(form.subscriptions) || 0
    const ait = parseFloat(form.adjInvalidTraffic) || 0
    const spend = parseFloat(form.adsSpend) || 0
    const taxes = parseFloat(form.taxes) || 0
    const rate = parseFloat(form.pkrRate) || 280

    const totalIncome = form.aitInMarketing ? ads + subs : ads + subs - ait
    const totalMarketing = form.aitInMarketing ? spend + taxes + ait : spend + taxes
    const balance = totalIncome - totalMarketing
    const share = balance * 0.30

    setComputed({
      totalIncome: totalIncome.toFixed(2),
      totalMarketing: totalMarketing.toFixed(2),
      balance: balance.toFixed(2),
      share: share.toFixed(2),
      sharePKR: Math.round(share * rate).toLocaleString(),
      balancePKR: Math.round(balance * rate).toLocaleString(),
    })
  }, [form])

  const monthId = `${form.year}-${String(form.month).padStart(2, '0')}`
  const monthName = `${MONTH_NAMES[form.month - 1]} ${form.year}`
  const isEdit = !!editId
  const existingIds = existingMonths.map(m => m.id)
  const monthAlreadyExists = !isEdit && existingIds.includes(monthId)

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('')
    try {
      const payload = {
        id: monthId, month: monthName,
        fiscalYear: getFiscalYear(form.year, form.month),
        adsRevenue: parseFloat(form.adsRevenue) || 0,
        subscriptions: parseFloat(form.subscriptions) || 0,
        adjInvalidTraffic: parseFloat(form.adjInvalidTraffic) || 0,
        adsSpend: parseFloat(form.adsSpend) || 0,
        taxes: parseFloat(form.taxes) || 0,
        pkrRate: parseFloat(form.pkrRate) || 280,
        aitInMarketing: form.aitInMarketing,
        paymentStatus: form.paymentStatus,
        receiptUrl: form.receiptUrl,
      }
      const url = isEdit ? `/api/admin/months/${monthId}` : '/api/admin/months'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
      } else {
        setSuccess(isEdit ? 'Month updated successfully!' : 'Month added successfully!')
        setExistingMonths(prev =>
          isEdit ? prev.map(m => m.id === monthId ? data : m) : [...prev, data].sort((a, b) => a.id.localeCompare(b.id))
        )
        if (!isEdit) setEditId(monthId)
        // Auto-clear success after 4s
        setTimeout(() => setSuccess(''), 4000)
      }
    } catch { setError('Connection error') }
    finally { setSaving(false) }
  }

  // Fix 2: Clear Record — zeros out all fields for the selected month
  async function handleClear() {
    if (!isEdit) return
    if (!window.confirm(`Clear all data for ${monthName}? This will zero out all values but keep the month record.`)) return
    setClearing(true); setError(''); setSuccess('')
    try {
      const payload = {
        id: monthId, month: monthName,
        fiscalYear: getFiscalYear(form.year, form.month),
        adsRevenue: 0, subscriptions: 0, adjInvalidTraffic: 0,
        adsSpend: 0, taxes: 0,
        pkrRate: parseFloat(form.pkrRate) || 280,
        aitInMarketing: false,
        paymentStatus: 'Pending',
        receiptUrl: '',
      }
      const res = await fetch(`/api/admin/months/${monthId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Clear failed') }
      else {
        setForm(f => ({ ...f, adsRevenue: 0, subscriptions: 0, adjInvalidTraffic: 0, adsSpend: 0, taxes: 0, aitInMarketing: false, paymentStatus: 'Pending', receiptUrl: '' }))
        setExistingMonths(prev => prev.map(m => m.id === monthId ? data : m))
        setSuccess('Record cleared successfully.')
        setTimeout(() => setSuccess(''), 4000)
      }
    } catch { setError('Connection error') }
    finally { setClearing(false) }
  }

  // Delete record completely from database
  async function handleDelete() {
    if (!isEdit) return
    if (!window.confirm(`Permanently delete ${monthName}? This cannot be undone.`)) return
    setDeleting(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`/api/admin/months/${monthId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Delete failed') }
      else {
        setExistingMonths(prev => prev.filter(m => m.id !== monthId))
        setEditId('')
        setForm(f => ({ ...f, adsRevenue: '', subscriptions: '', adjInvalidTraffic: '', adsSpend: '', taxes: '', pkrRate: '283', aitInMarketing: false, paymentStatus: 'Pending', receiptUrl: '' }))
        setSuccess(`${monthName} deleted successfully.`)
        setTimeout(() => setSuccess(''), 4000)
      }
    } catch { setError('Connection error') }
    finally { setDeleting(false) }
  }

  const field = (label, key, type = 'number', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input" type={type} step="0.01" placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <>
      <Head><title>Data Entry — Admin</title></Head>
      <Layout user={user} adminLinks={NAV} investorLinks={NAV}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.4rem', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
                Monthly Data Entry
              </h1>
              <p style={{ fontSize: '0.82rem', color: c.textMuted, marginTop: 5, fontFamily: 'Exo 2, sans-serif' }}>
                Add or edit monthly revenue data
              </p>
            </div>
            <Link href="/admin" className="btn-ghost" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>← Back</Link>
          </div>

          {/* Edit existing selector */}
          {existingMonths.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <label className="label">Edit Existing Month</label>
              <select className="input" value={editId} onChange={e => { setEditId(e.target.value); setError(''); setSuccess('') }}>
                <option value="">— Add new month —</option>
                {[...existingMonths].reverse().map(m => (
                  <option key={m.id} value={m.id}>{m.month}</option>
                ))}
              </select>
            </div>
          )}

          <div className="card">
            <h2 style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: c.textPrimary, marginBottom: 20, marginTop: 0 }}>
              {isEdit ? `Editing: ${monthName}` : 'New Month Entry'}
            </h2>

            {/* Month / Year picker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                  disabled={isEdit}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Month</label>
                <select className="input" value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}
                  disabled={isEdit}>
                  {MONTH_NAMES.map((mn, i) => (
                    <option key={i + 1} value={i + 1}>{mn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fix 3: Month already exists warning — bold and prominent */}
            {monthAlreadyExists && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 16px', borderRadius: 10, marginBottom: 20,
                background: 'rgba(251,191,36,0.1)',
                border: '1.5px solid rgba(251,191,36,0.5)',
                boxShadow: '0 0 14px rgba(251,191,36,0.12)',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <div>
                  <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.5, color: '#d97706', marginBottom: 3 }}>
                    Month Already Exists
                  </p>
                  <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', color: c.isLight ? '#92400e' : '#fde68a', margin: 0 }}>
                    <strong>{monthName}</strong> already exists. Use the <strong>"Edit Existing Month"</strong> selector above to modify it.
                  </p>
                </div>
              </div>
            )}

            {/* Income */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: c.textMuted, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${c.cardBorder}` }}>
                💰 Income (USD)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {field('Ads Revenue', 'adsRevenue', 'number', '0.00')}
                {field('Subscriptions / IAP', 'subscriptions', 'number', '0.00')}
                {field('Adj Invalid Traffic', 'adjInvalidTraffic', 'number', '0.00')}
              </div>
            </div>

            {/* Marketing */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: c.textMuted, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${c.cardBorder}` }}>
                📣 Marketing Costs (USD)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
                {field('Ads Spend', 'adsSpend', 'number', '0.00')}
                {field('Taxes', 'taxes', 'number', '0.00')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: c.isLight ? 'rgba(30,111,255,0.04)' : 'rgba(7,21,69,0.4)', border: `1px solid ${c.cardBorder}` }}>
                <input id="aitToggle" type="checkbox" checked={form.aitInMarketing}
                  onChange={e => setForm(f => ({ ...f, aitInMarketing: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#fbbf24' }}
                />
                <label htmlFor="aitToggle" style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', cursor: 'pointer', color: c.textSub }}>
                  Include AIT in Marketing costs{' '}
                  <span style={{ color: c.textMuted }}>(old format: Jul 2024 – Jun 2025)</span>
                </label>
              </div>
            </div>

            {/* Settings */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: c.textMuted, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${c.cardBorder}` }}>
                ⚙️ Settings
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {field('USD / PKR Rate', 'pkrRate', 'number', '283')}
                <div>
                  <label className="label">Payment Status</label>
                  <select className="input" value={form.paymentStatus}
                    onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}>
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
                {field('Receipt URL (optional)', 'receiptUrl', 'url', 'https://...')}
              </div>
            </div>

            {/* Live Preview */}
            {computed && (
              <div style={{ marginBottom: 20, borderRadius: 10, border: `1px solid ${c.cardBorder}`, padding: 16, background: c.isLight ? 'rgba(240,245,255,0.5)' : 'rgba(7,21,69,0.3)' }}>
                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: 1.2, textTransform: 'uppercase', color: c.textMuted, marginBottom: 12 }}>
                  Live Preview
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {[
                    { label: 'Total Income', value: `$${computed.totalIncome}`, color: c.textPrimary },
                    { label: 'Total Marketing', value: `$${computed.totalMarketing}`, color: c.red },
                    { label: 'Net Balance', value: `$${computed.balance}`, color: c.textPrimary },
                    { label: 'Investor 30%', value: `$${computed.share} / PKR ${computed.sharePKR}`, color: c.green },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: '10px 12px', borderRadius: 8, background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
                      <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.56rem', color: c.textMuted, marginBottom: 5, letterSpacing: 0.8 }}>{label}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700, color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fix 1: Error toast — bold, prominent red */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                background: c.isLight ? 'rgba(220,38,38,0.06)' : 'rgba(248,113,113,0.08)',
                border: `1.5px solid ${c.isLight ? 'rgba(220,38,38,0.4)' : 'rgba(248,113,113,0.45)'}`,
                boxShadow: `0 0 12px ${c.isLight ? 'rgba(220,38,38,0.1)' : 'rgba(248,113,113,0.1)'}`,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>❌</span>
                <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: c.isLight ? '#dc2626' : '#f87171', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Fix 1: Success toast — bold, prominent green */}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                background: c.isLight ? 'rgba(5,150,105,0.07)' : 'rgba(52,211,153,0.08)',
                border: `1.5px solid ${c.isLight ? 'rgba(5,150,105,0.45)' : 'rgba(52,211,153,0.45)'}`,
                boxShadow: `0 0 14px ${c.isLight ? 'rgba(5,150,105,0.12)' : 'rgba(52,211,153,0.15)'}`,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
                <p style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: c.isLight ? '#065f46' : '#34d399', margin: 0 }}>{success}</p>
              </div>
            )}

            {/* Fix 2: Action buttons row — Update Month + Clear Record */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={saving || monthAlreadyExists}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 8, border: 'none', cursor: saving || monthAlreadyExists ? 'not-allowed' : 'pointer',
                  fontFamily: 'Exo 2, sans-serif', fontSize: '0.9rem', fontWeight: 700,
                  background: saving || monthAlreadyExists
                    ? 'rgba(30,111,255,0.3)'
                    : 'linear-gradient(135deg, #1e6fff, #00a8e8)',
                  color: '#fff',
                  boxShadow: saving || monthAlreadyExists ? 'none' : '0 0 20px rgba(30,111,255,0.4)',
                  transition: '0.2s ease',
                  opacity: saving || monthAlreadyExists ? 0.6 : 1,
                }}>
                {saving ? '⏳ Saving…' : isEdit ? '✓ Update Month' : '+ Save New Month'}
              </button>

              {/* Clear Record + Delete Record — edit mode only */}
              {isEdit && (
                <>
                  <button
                    onClick={handleClear}
                    disabled={clearing || deleting}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px 16px', borderRadius: 8, cursor: clearing ? 'not-allowed' : 'pointer',
                      fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                      background: 'transparent',
                      color: c.isLight ? '#d97706' : '#fbbf24',
                      border: `1.5px solid ${c.isLight ? 'rgba(217,119,6,0.35)' : 'rgba(251,191,36,0.35)'}`,
                      transition: '0.2s ease', opacity: clearing ? 0.6 : 1, whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.isLight ? 'rgba(217,119,6,0.06)' : 'rgba(251,191,36,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    {clearing ? '⏳ Clearing…' : '🔄 Clear Data'}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting || clearing}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px 16px', borderRadius: 8, cursor: deleting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                      background: 'transparent',
                      color: c.isLight ? '#dc2626' : '#f87171',
                      border: `1.5px solid ${c.isLight ? 'rgba(220,38,38,0.35)' : 'rgba(248,113,113,0.35)'}`,
                      transition: '0.2s ease', opacity: deleting ? 0.6 : 1, whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.isLight ? 'rgba(220,38,38,0.06)' : 'rgba(248,113,113,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    {deleting ? '⏳ Deleting…' : '🗑 Delete Record'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
