import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◉' },
  { href: '/admin/entry', label: 'Data Entry', icon: '✏️' },
  { href: '/admin/investors', label: 'Investors', icon: '👥' },
]

const EMPTY_FORM = { name: '', username: '', password: '', sharePercent: 30, email: '', notes: '' }

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

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/admin/investors').then(r => r.json()),
    ]).then(([u, inv]) => {
      setUser(u)
      setInvestors(Array.isArray(inv) ? inv : [])
    })
  }, [])

  function startEdit(inv) {
    setEditId(inv.id)
    setForm({ ...inv, password: '' })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function startAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function cancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
    setSuccess('')
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
        setSuccess(editId ? 'Investor updated!' : 'Investor added!')
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

  async function handleDelete(id) {
    const res = await fetch(`/api/admin/investors/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setInvestors(prev => prev.filter(i => i.id !== id))
      setConfirmDelete(null)
    }
  }

  return (
    <>
      <Head><title>Investors — Admin</title></Head>
      <Layout user={user} adminLinks={NAV} investorLinks={NAV}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Investor Accounts
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
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
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No investors yet</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Add your first investor to get started</p>
                  <button onClick={startAdd} className="btn-gold mx-auto">+ Add Investor</button>
                </div>
              )}
              {investors.map(inv => (
                <div key={inv.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #d4a853, #f0d080)', color: '#1a1208' }}>
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{inv.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
                        <span className="text-xs text-red-400">Sure?</span>
                        <button onClick={() => handleDelete(inv.id)} className="btn-danger text-xs px-2 py-1">Yes</button>
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
              <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>
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
                </div>
                <div>
                  <label className="label">{editId ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input className="input" type="password" placeholder={editId ? '••••••••' : 'Set a strong password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Share % (default 30)</label>
                  <input className="input" type="number" min="1" max="100" step="0.5" placeholder="30"
                    value={form.sharePercent}
                    onChange={e => setForm(f => ({ ...f, sharePercent: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input className="input" type="email" placeholder="investor@example.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input className="input" placeholder="e.g. Silent partner since 2024" value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              {error && <div className="mt-4 text-xs px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400">{error}</div>}
              {success && <div className="mt-4 text-xs px-3 py-2.5 rounded-lg bg-emerald-900/20 border border-emerald-800/40 text-emerald-400">{success}</div>}

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
