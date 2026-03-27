import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Login failed')
      else router.push(data.role === 'admin' ? '/admin' : '/investor')
    } catch { setError('Connection error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>Sign In — Viral Mobitech Investor Portal</title>
      </Head>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Radial glow bg */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(30,111,255,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(0,200,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }} className="fade-up">
            <img
              src="/logo-dark.png"
              alt="Viral Mobitech"
              style={{
                width: 80, height: 80,
                borderRadius: 18,
                objectFit: 'cover',
                margin: '0 auto 14px',
                display: 'block',
                boxShadow: '0 0 35px rgba(0,200,255,0.45)',
              }}
            />

            {/* Blinking badge */}
            <div className="hero-badge" style={{ margin: '0 auto 16px', width: 'fit-content' }}>
              Investor Portal
            </div>

            <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color: '#e8f4ff', margin: 0 }}>
              Viral<span style={{ color: '#00c8ff' }}>Mobitech</span>
            </h1>
          </div>

          {/* Card */}
          <div className="card fade-up-1">
            <h2 style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#6a9abf', marginBottom: 20, marginTop: 0 }}>
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Username</label>
                <input className="input" type="text" autoComplete="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required />
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    style={{ paddingRight: 40 }}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6a9abf',
                    }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500,
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171',
                }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-cyan"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '13px' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Authenticating...
                  </span>
                ) : 'Access Portal'}
              </button>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.72rem', color: 'rgba(106,154,191,0.6)', fontFamily: 'Exo 2, sans-serif' }}>
            Secured & Private — Viral Mobitech © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}
