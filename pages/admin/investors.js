import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◉' },
  { href: '/admin/entry', label: 'Data Entry', icon: '✏️' },
  { href: '/admin/investors', label: 'Investors', icon: '👥' },
]

const EMPTY_FORM = { name: '', username: '', password: '', sharePercent: 30, email: '', notes: '' }
const PORTAL_URL = 'https://viral-mobitech-investor.vercel.app'

function generatePassword(name = '') {
  const specials = ['@', '#', '!', '$', '%']
  const words = ['Invest', 'Profit', 'Secure', 'Capital', 'Growth', 'Venture', 'Yield', 'Asset']
  const word = name
    ? name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase()
    : words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(Math.random() * 900) + 100
  const special = specials[Math.floor(Math.random() * specials.length)]
  const suffix = Math.floor(Math.random() * 90) + 10
  return `${word}${num}${special}${suffix}`
}

function suggestUsername(name) {
  if (!name) return ''
  const parts = name.trim().toLowerCase().split(/\s+/)
  if (parts.length >= 2) return parts[0] + parts[parts.length - 1].charAt(0)
  return parts[0]
}

function downloadCredentials(investor, password) {
  const content = [
    '================================================',
    '   VIRAL MOBITECH — INVESTOR PORTAL ACCESS',
    '================================================',
    '',
    `  Investor Name : ${investor.name}`,
    `  Portal Link   : ${PORTAL_URL}`,
    `  Username      : ${investor.username}`,
    `  Password      : ${password}`,
    `  Share %       : ${investor.sharePercent}%`,
    investor.email ? `  Email         : ${investor.email}` : '',
    '',
    '------------------------------------------------',
    '  IMPORTANT: Keep these credentials confidential',
    '  Do not share with unauthorized persons.',
    '================================================',
    `  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    '================================================',
  ].filter(l => l !== null).join('\n')

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${investor.username}-portal-credentials.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function InvestorsAdmin() {
  const [user, setUser] = useState(null)
  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true) // FIX 3: loading state
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [usernameSuggestions, setUsernameSuggestions] = useState([])
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [savedCredentials, setSavedCredentials] = useState(null) // FIX 1: credentials modal

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/admin/investors').then(r => r.json()),
    ]).then(([u, inv]) => {
      setUser(u)
      setInvestors(Array.isArray(inv) ? inv : [])
      setLoading(false) // FIX 3: done loading
    })
  }, [])

  // Username suggestions
  useEffect(() => {
    if (!editId && form.name && form.name.length > 2) {
      const base = suggestUsername(form.name)
      const last = form.name.split(' ').slice(-1)[0]?.toLowerCase() || ''
      setUsernameSuggestions([base, base + '2025', form.name.split(' ')[0][0]?.toLowerCase() + last].filter((v, i, a) => v && a.indexOf(v) === i))
    } else setUsernameSuggestions([])
  }, [form.name, editId])

  // Password strength
  useEffect(() => {
    const p = form.password
    if (!p) { setPasswordStrength(null); return }
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const levels = [
      { label: 'Weak', color: '#dc2626', bg: 'bg-red-500', width: '20%' },
      { label: 'Weak', color: '#dc2626', bg: 'bg-red-500', width: '20%' },
      { label: 'Fair', color: '#d97706', bg: 'bg-amber-500', width: '45%' },
      { label: 'Good', color: '#ca8a04', bg: 'bg-yellow-500', width: '65%' },
      { label: 'Strong', color: '#16a34a', bg: 'bg-green-600', width: '85%' },
      { label: 'Very Strong', color: '#15803d', bg: 'bg-green-700', width: '100%' },
    ]
    setPasswordStrength(levels[score])
  }, [form.password])

  function startEdit(inv) {
    setEditId(inv.id)
    // FIX 2: pre-fill with stored plain password
    setForm({ ...inv, password: inv.plainPassword || '' })
    setShowForm(true)
    setShowPass(inv.plainPassword ? true : false)
    setError(''); setSuccess('')
  }

  function startAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setShowPass(false)
    setError(''); setSuccess('')
  }

  function cancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setError(''); setSuccess('')
  }

  function handleGeneratePassword() {
    const pwd = generatePassword(form.name)
    setForm(f => ({ ...f, password: pwd }))
    setShowPass(true)
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('')
    try {
      const url = editId ? `/api/admin/investors/${editId}` : '/api/admin/investors'
      const method = editId ? 'PUT' : 'POST'
      const payload = { ...form }
      if (editId && !payload.password) delete payload.password

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
      } else {
        if (editId) {
          setInvestors(prev => prev.map(i => i.id === editId ? data : i))
          setSuccess('Investor updated successfully!')
          setTimeout(cancel, 1500)
        } else {
          setInvestors(prev => [...prev, data])
          // FIX 1: show credentials modal after creating
          setSavedCredentials({ investor: data, password: form.password })
          cancel()
        }
      }
    } catch { setError('Connection error') }
    finally { setSaving(false) }
  }

  return (
    <>
      <Head><title>Investors — Admin</title></Head>
      <Layout user={user} adminLinks={NAV} investorLinks={NAV}>
        <div className="max-w-3xl mx-auto">

          {/* FIX 1: Credentials modal after creating investor */}
          {savedCredentials && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="card w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: 'linear-gradient(135deg, #b8860b, #d4a017)' }}>
                    ✓
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Investor Created!</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Share these credentials with {savedCredentials.investor.name}</p>
                  </div>
                </div>

                <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  {[
                    { label: 'Portal Link', value: PORTAL_URL },
                    { label: 'Username', value: savedCredentials.investor.username },
                    { label: 'Password', value: savedCredentials.password },
                    { label: 'Share %', value: `${savedCredentials.investor.sharePercent}%` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadCredentials(savedCredentials.investor, savedCredentials.password)}
                    className="btn-gold flex-1 justify-center">
                    ⬇ Download Credentials
                  </button>
                  <button onClick={() => setSavedCredentials(null)} className="btn-ghost px-4">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Investor Accounts
              </h1>
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : `${investors.length} investor${investors.length !== 1 ? 's' : ''} registered`}
              </p>
            </div>
            {!showForm && !loading && (
              <button onClick={startAdd} className="btn-gold text-sm">+ Add Investor</button>
            )}
          </div>

          {/* FIX 3: Show spinner while loading, not empty state */}
          {loading ? (
            <div className="card flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                  style={{ borderColor: 'var(--border)', borderTopColor: '#b8860b' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading investors…</p>
              </div>
            </div>
          ) : !showForm ? (
            <div className="flex flex-col gap-3 mb-6">
              {investors.length === 0 && (
                <div className="card text-center py-10">
                  <p className="text-3xl mb-3">👥</p>
                  <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No investors yet</p>
                  <p className="text-sm mb-4 font-medium" style={{ color: 'var(--text-muted)' }}>Add your first investor to get started</p>
                  <button onClick={startAdd} className="btn-gold mx-auto">+ Add Investor</button>
                </div>
              )}
              {investors.map(inv => (
                <div key={inv.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #b8860b, #d4a017)' }}>
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{inv.name}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        @{inv.username} · {inv.sharePercent}% share{inv.email ? ` · ${inv.email}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => downloadCredentials(inv, inv.plainPassword || '••••••••')}
                      className="btn-ghost text-xs px-3 py-1.5">⬇ Creds</button>
                    <button onClick={() => startEdit(inv)} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                    {confirmDelete === inv.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Sure?</span>
                        <button onClick={async () => {
                          const res = await fetch(`/api/admin/investors/${inv.id}`, { method: 'DELETE' })
                          if (res.ok) { setInvestors(prev => prev.filter(i => i.id !== inv.id)); setConfirmDelete(null) }
                        }} className="btn-danger text-xs px-2 py-1">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="btn-ghost text-xs px-2 py-1">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(inv.id)} className="btn-danger text-xs px-3 py-1.5">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Add / Edit form */}
          {showForm && (
            <div className="card">
              <h2 className="text-base font-bold mb-5" style={{ color: 'var(--text-secondary)' }}>
                {editId ? 'Edit Investor' : 'Add New Investor'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="e.g. Ahmed Khan" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Username * (used to log in)</label>
                  <input className="input" placeholder="e.g. ahmed" value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                  {usernameSuggestions.length > 0 && !form.username && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Suggestions:</span>
                      {usernameSuggestions.map(s => (
                        <button key={s} type="button"
                          onClick={() => setForm(f => ({ ...f, username: s }))}
                          className="text-xs px-2 py-0.5 rounded-full border font-semibold transition-all"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-base)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">{editId ? 'Password (current shown below)' : 'Password *'}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input className="input pr-10" type={showPass ? 'text' : 'password'}
                        placeholder={editId ? 'Leave blank to keep current' : 'Set a strong password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: 'var(--text-muted)' }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <button type="button" onClick={handleGeneratePassword}
                      className="btn-ghost text-xs px-3 whitespace-nowrap font-semibold">
                      ⚡ Generate
                    </button>
                  </div>

                  {passwordStrength && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Strength:</span>
                        <span className="text-xs font-bold" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className={`h-full rounded-full transition-all duration-500 ${passwordStrength.bg}`}
                          style={{ width: passwordStrength.width }} />
                      </div>
                    </div>
                  )}
                  {!form.password && !editId && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                      💡 Click ⚡ Generate for a strong auto-password
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Share % (default 30)</label>
                  <input className="input" type="number" min="1" max="100" step="0.5" value={form.sharePercent}
                    onChange={e => setForm(f => ({ ...f, sharePercent: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input className="input" type="email" placeholder="investor@example.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes (optional)</label>
                  <input className="input" placeholder="e.g. Silent partner since 2024" value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              {error && <div className="mt-4 text-xs px-3 py-2.5 rounded-lg font-medium" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>{error}</div>}
              {success && <div className="mt-4 text-xs px-3 py-2.5 rounded-lg font-medium" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#16a34a' }}>{success}</div>}

              <div className="flex items-center gap-3 mt-5">
                <button onClick={handleSave} disabled={saving} className="btn-gold">
                  {saving ? 'Saving…' : editId ? '✓ Update Investor' : '+ Add Investor'}
                </button>
                <button onClick={cancel} className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
