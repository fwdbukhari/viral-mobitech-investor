import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [isLight, setIsLight] = useState(false)

  // Detect theme for logo + text color switching
  useEffect(() => {
    function check() {
      setIsLight(document.documentElement.classList.contains('light-mode'))
    }
    check()
    const saved = localStorage.getItem('vm_theme') || 'dark'
    if (saved === 'light') {
      document.documentElement.classList.add('light-mode')
      setIsLight(true)
    } else if (saved === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (!prefersDark) { document.documentElement.classList.add('light-mode'); setIsLight(true) }
    }
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

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

  // Theme-aware colors
  const textPrimary = isLight ? '#0d1033' : '#e8f4ff'
  const textMuted   = isLight ? '#4a5578' : '#6a9abf'
  const cardBg      = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(7,21,69,0.55)'
  const cardBorder  = isLight ? 'rgba(30,111,255,0.15)' : 'rgba(0,200,255,0.18)'
  const inputBg     = isLight ? 'rgba(235,242,255,0.8)' : 'rgba(7,21,69,0.6)'
  const inputBorder = isLight ? 'rgba(30,111,255,0.22)' : 'rgba(0,200,255,0.18)'
  const cyan        = isLight ? '#1e6fff' : '#00c8ff'
  const logoSrc     = isLight ? '/logo-light.png' : '/logo-dark.png'
  const logoShadow  = isLight
    ? '0 4px 20px rgba(30,111,255,0.25)'
    : '0 0 35px rgba(0,200,255,0.45)'

  return (
    <>
      <Head>
        <title>Sign In — Viral Mobitech Investor Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
      </Head>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
        background: isLight
          ? 'linear-gradient(160deg, #eef2ff 0%, #e8f0fe 50%, #f0f4ff 100%)'
          : 'linear-gradient(160deg, #010a1e 0%, #040f2e 50%, #010d1f 100%)',
      }}>
        {/* Animated grid — dark only */}
        {!isLight && (
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)',
            backgroundSize: '55px 55px',
          }} />
        )}

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          background: isLight
            ? 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(30,111,255,0.1) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(30,111,255,0.14) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: 400, height: 400,
          background: isLight
            ? 'radial-gradient(ellipse, rgba(30,111,255,0.06) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(0,200,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>

            {/* Logo — image has its own bg, display directly with rounded corners */}
            <img
              src={logoSrc}
              alt="Viral Mobitech"
              style={{
                width: 84, height: 84,
                borderRadius: 18,
                objectFit: 'cover',
                margin: '0 auto 16px',
                display: 'block',
                boxShadow: logoShadow,
              }}
            />

            {/* Blinking badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 16px', borderRadius: 50, marginBottom: 14,
              border: `1px solid ${isLight ? 'rgba(30,111,255,0.3)' : 'rgba(0,200,255,0.3)'}`,
              background: isLight ? 'rgba(30,111,255,0.07)' : 'rgba(0,200,255,0.07)',
              color: cyan,
              fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cyan, boxShadow: `0 0 8px ${cyan}`, display: 'inline-block', animation: 'blink 2s infinite' }} />
              Investor Portal
            </div>

            {/* Fix 1: "Viral" now uses textPrimary, not hardcoded white */}
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', margin: 0, color: textPrimary }}>
              Viral<span style={{ color: cyan }}>Mobitech</span>
            </h1>
          </div>

          {/* Card */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 14,
            padding: '24px 22px',
            backdropFilter: isLight ? 'none' : 'blur(10px)',
            WebkitBackdropFilter: isLight ? 'none' : 'blur(10px)',
            boxShadow: isLight ? '0 4px 24px rgba(30,111,255,0.08)' : 'none',
          }}>
            <h2 style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.92rem', fontWeight: 600, color: textMuted, marginBottom: 20, marginTop: 0 }}>
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: textMuted, marginBottom: 6 }}>
                  Username
                </label>
                <input
                  type="text" autoComplete="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    fontFamily: 'Exo 2, sans-serif', fontSize: '0.9rem',
                    background: inputBg, border: `1px solid ${inputBorder}`,
                    color: textPrimary, outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = cyan}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: textMuted, marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    style={{
                      width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8,
                      fontFamily: 'Exo 2, sans-serif', fontSize: '0.9rem',
                      background: inputBg, border: `1px solid ${inputBorder}`,
                      color: textPrimary, outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = cyan}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: textMuted,
                    }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                  background: isLight ? 'rgba(220,38,38,0.06)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${isLight ? 'rgba(220,38,38,0.35)' : 'rgba(248,113,113,0.3)'}`,
                  color: isLight ? '#dc2626' : '#f87171',
                }}>
                  ❌ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 4,
                  background: 'linear-gradient(135deg, #1e6fff, #00c8ff)',
                  color: '#fff', fontFamily: 'Orbitron, monospace', fontSize: '0.78rem',
                  fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                  boxShadow: '0 0 25px rgba(0,200,255,0.45)',
                  opacity: loading ? 0.7 : 1, transition: '0.2s ease',
                }}>
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
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.72rem', color: textMuted, fontFamily: 'Exo 2, sans-serif', opacity: 0.7 }}>
            Secured & Private — Viral Mobitech © {new Date().getFullYear()}
          </p>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }
          input::placeholder { color: ${isLight ? '#8899bb' : '#4a6a8a'}; }
        `}</style>
      </div>
    </>
  )
}
