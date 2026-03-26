import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◉' },
  { href: '/admin/entry', label: 'Data Entry', icon: '✏️' },
  { href: '/admin/investors', label: 'Investors', icon: '👥' },
]

const EMPTY_FORM = { name: '', username: '', password: '', sharePercent: 30, email: '', notes: '' }

// Generate a strong password
function generatePassword(name = '') {
  const specials = ['@', '#', '!', '$', '%']
  const words = ['Invest', 'Profit', 'Secure', 'Capital', 'Growth', 'Venture', 'Yield', 'Asset']
  const word = name ? name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase() : words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(Math.random() * 900) + 100
  const special = specials[Math.floor(Math.random() * specials.length)]
  const suffix = Math.floor(Math.random() * 90) + 10
  return `${word}${num}${special}${suffix}`
}

// Generate username from name
function suggestUsername(name) {
  if (!name) return ''
  const parts = name.trim().toLowerCase().split(/\s+/)
  if (parts.length >= 2) return parts[0] + parts[parts.length - 1].charAt(0)
  return parts[0]
}

export default function InvestorsAdmin() {
  const [user, setUser] = useState(null)
  const [investors, setInvestors] = useState([])
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

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/admin/investors').then(r => r.json()),
    ]).then(([u, inv]) => {
      setUser(u)
      setInvestors(Array.isArray(inv) ? inv : [])
    })
  }, [])

  // Auto-suggest username when name changes
  useEffect(() => {
    if (!editId && form.name && form.name.length > 2) {
      const base = suggestUsername(form.name)
      setUsernameSuggestions([
        base,
        base + '2025',
        base.charAt(0) + form.name.split(' ').slice(-1)[0]?.toLowerCase() || base,
      ].filter((v, i, arr) => arr.indexOf(v) === i))
    } else {
      setUsernameSuggestions([])
    }
  }, [form.name, editId])

  // Password strength checker
  useEffect(() => {
    const p = form.password
    if (!p) { setPasswordStrength(null); return }
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (score <= 1) setPasswordStrength({ label: 'Weak', color: '#dc2626', bg: 'bg-red-500', width: '20%' })
    else if (score <= 2) setPasswordStrength({ label: 'Fair', color: '#d97706', bg: 'bg-amber-500', width: '45%' })
    else if (score <= 3) setPasswordStrength({ label: 'Good', color: '#ca8a04', bg: 'bg-yellow-500', width: '65%' })
    else if (score <= 4) setPasswordStrength({ label: 'Strong', color: '#16a34a', bg: 'bg-green-600', width: '85%' })
    else setPasswordStrength({ label: 'Very Strong', color: '#15803d', bg: 'bg-green-700', width: '100%' })
  }, [form.password])

  function startEdit(inv) {
    setEditId(inv.id)
    setForm({ ...inv, password: '' })
    setShowForm(true)
    setError('')
    setSuccess('')
    setShowPass(false)
  }

  function startAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError('')
    setSuccess('')
    setShowPass(false)
  }

  function cancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
    setSuccess('')
  }

  function handleGeneratePassword() {
    const pwd = generatePassword(form.name)
    setForm(f => ({ ...f, password: pwd }))
    setShowPass(true)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
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
        setSuccess(editId ? 'Investor updated successfully!' : 'Investor added successfully!')
        if (editId) {
          setInvestors(prev => prev.map(i => i.id === editId ? data : i))
        } else {
          setInvestors(prev => [...prev, data])
        }
        setTimeout(cancel, 1500)
      }
    } catch {
      setError('Connection error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Head><title>Investors — Admin</title></Head>
      <Layout user={user} adminLinks={NAV} investorLinks={NAV}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Investor Accounts
              </h1>
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                {investors.length} investor{investors.length !== 1 ? 's' : ''} registered
              </p>
            </div>
            {!showForm && (
              <button onClick={startAdd} className="btn-gold text-sm">+ Add Investor</button>
            )}
          </div>

          {/* Investor list */}
          {!showForm && (
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
                        @{inv.username} · {inv.sharePercent}% share
                        {inv.email ? ` · ${inv.email}` : ''}
                      </p>
                      {inv.notes && <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{inv.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
          )}

          {/* Add / Edit form */}
          {showForm && (
            <div className="card">
              <h2 className="text-base font-bold mb-5" style={{ color: 'var(--text-secondary)' }}>
                {editId ? 'Edit Investor' : 'Add New Investor'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="e.g. Ahmed Khan" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                {/* Username */}
                <div>
                  <label className="label">Username * (used to log in)</label>
                  <input className="input" placeholder="e.g. ahmed" value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                  {/* Username suggestions */}
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

                {/* Password */}
                <div className="sm:col-span-2">
                  <label className="label">{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input className="input pr-10" type={showPass ? 'text' : 'password'}
                        placeholder={editId ? '••••••••' : 'Set a strong password'}
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

                  {/* Password strength bar */}
                  {passwordStrength && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                          Password strength:
                        </span>
                        <span className="text-xs font-bold" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className={`h-full rounded-full transition-all duration-500 ${passwordStrength.bg}`}
                          style={{ width: passwordStrength.width }} />
                      </div>
                      {passwordStrength.label === 'Weak' && (
                        <p className="text-xs mt-1 font-medium" style={{ color: '#dc2626' }}>
                          Add uppercase letters, numbers and symbols
                        </p>
                      )}
                      {passwordStrength.label === 'Fair' && (
                        <p className="text-xs mt-1 font-medium" style={{ color: '#d97706' }}>
                          Add more characters or special symbols
                        </p>
                      )}
                    </div>
                  )}

                  {/* Password tips */}
                  {!form.password && !editId && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                      💡 Click ⚡ Generate for a strong password, or create one with 8+ chars, uppercase, number & symbol
                    </p>
                  )}
                </div>

                {/* Share % */}
                <div>
                  <label className="label">Share % (default 30)</label>
                  <input className="input" type="number" min="1" max="100" step="0.5" placeholder="30"
                    value={form.sharePercent}
                    onChange={e => setForm(f => ({ ...f, sharePercent: e.target.value }))} />
                </div>

                {/* Email */}
                <div>
                  <label className="label">Email (optional)</label>
                  <input className="input" type="email" placeholder="investor@example.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>

                {/* Notes */}
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
