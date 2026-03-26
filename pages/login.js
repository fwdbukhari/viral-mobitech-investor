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
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        if (data.role === 'admin') router.push('/admin')
        else router.push('/investor')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign In — Viral Mobitech Investor Portal</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'var(--bg-base)' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(ellipse, #d4a853 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(ellipse, #d4a853 0%, transparent 70%)' }} />
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #b8860b, #d4a017)' }}>
              <span className="font-display font-bold text-xl text-yellow-900">VM</span>
            </div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Viral Mobitech
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Investor Portal
            </p>
          </div>

          {/* Card */}
          <div className="card shadow-2xl">
            <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Username</label>
                <input
                  className="input"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: 'var(--text-muted)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-2.5 mt-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
            Secured & Private — Viral Mobitech © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}
