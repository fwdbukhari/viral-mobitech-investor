import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'

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

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        id: monthId,
        month: monthName,
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
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Save failed')
      } else {
        setSuccess(isEdit ? 'Month updated successfully!' : 'Month added successfully!')
        setExistingMonths(prev =>
          isEdit ? prev.map(m => m.id === monthId ? data : m) : [...prev, data].sort((a, b) => a.id.localeCompare(b.id))
        )
        if (!isEdit) setEditId(monthId)
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setSaving(false)
    }
  }

  const field = (label, key, type = 'number', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        step="0.01"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <>
      <Head><title>Data Entry — Admin</title></Head>
      <Layout user={user} adminLinks={NAV} investorLinks={NAV}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Monthly Data Entry
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Add or edit monthly revenue data
              </p>
            </div>
            <Link href="/admin" className="btn-ghost text-sm">← Back</Link>
          </div>

          {/* Edit existing selector */}
          {existingMonths.length > 0 && (
            <div className="card mb-5">
              <label className="label">Edit Existing Month</label>
              <select className="input" value={editId} onChange={e => setEditId(e.target.value)}>
                <option value="">— Add new month —</option>
                {[...existingMonths].reverse().map(m => (
                  <option key={m.id} value={m.id}>{m.month}</option>
                ))}
              </select>
            </div>
          )}

          <div className="card">
            <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>
              {isEdit ? `Editing: ${monthName}` : 'New Month Entry'}
            </h2>

            {/* Month / Year picker */}
            <div className="grid grid-cols-2 gap-3 mb-5">
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

            {!isEdit && existingIds.includes(monthId) && (
              <div className="text-xs px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-800/40 text-amber-400 mb-4">
                ⚠️ {monthName} already exists. Use the "Edit Existing Month" selector above to modify it.
              </div>
            )}

            {/* Income section */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                💰 Income (USD)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {field('Ads Revenue', 'adsRevenue', 'number', '0.00')}
                {field('Subscriptions / IAP', 'subscriptions', 'number', '0.00')}
                {field('Adj Invalid Traffic', 'adjInvalidTraffic', 'number', '0.00')}
              </div>
            </div>

            {/* Marketing section */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                📣 Marketing Costs (USD)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('Ads Spend', 'adsSpend', 'number', '0.00')}
                {field('Taxes', 'taxes', 'number', '0.00')}
              </div>
              <div className="mt-3 flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-base)' }}>
                <input
                  id="aitToggle"
                  type="checkbox"
                  checked={form.aitInMarketing}
                  onChange={e => setForm(f => ({ ...f, aitInMarketing: e.target.checked }))}
                  className="w-4 h-4 accent-amber-400"
                />
                <label htmlFor="aitToggle" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  Include AIT in Marketing costs{' '}
                  <span style={{ color: 'var(--text-muted)' }}>(old format: Jul 2024 – Jun 2025)</span>
                </label>
              </div>
            </div>

            {/* Settings */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                ⚙️ Settings
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div className="mb-5 rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Live Preview
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Income', value: `$${computed.totalIncome}` },
                    { label: 'Total Marketing', value: `$${computed.totalMarketing}`, red: true },
                    { label: 'Net Balance', value: `$${computed.balance}`, gold: true },
                    { label: 'Investor 30%', value: `$${computed.share} / PKR ${computed.sharePKR}`, green: true },
                  ].map(({ label, value, red, gold, green }) => (
                    <div key={label} className="rounded-lg p-2.5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className={`text-sm font-mono font-semibold ${gold ? 'gold-text' : green ? 'text-emerald-400' : red ? 'text-red-400' : ''}`}
                        style={!gold && !green && !red ? { color: 'var(--text-primary)' } : {}}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 text-xs px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400">{error}</div>
            )}
            {success && (
              <div className="mb-4 text-xs px-3 py-2.5 rounded-lg bg-emerald-900/20 border border-emerald-800/40 text-emerald-400">{success}</div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || (!isEdit && existingIds.includes(monthId))}
              className="btn-gold w-full justify-center py-2.5">
              {saving ? 'Saving…' : isEdit ? '✓ Update Month' : '+ Save New Month'}
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}
