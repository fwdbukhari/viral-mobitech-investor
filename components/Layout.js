import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { applyTheme } from '../pages/_app'

const SunIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const SystemIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function ThemeSwitcher() {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const saved = localStorage.getItem('vm_theme') || 'dark'
    setTheme(saved)
  }, [])

  const set = (t) => {
    setTheme(t)
    applyTheme(t)
  }

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
      {[
        { key: 'light', icon: <SunIcon />, label: 'Light' },
        { key: 'dark', icon: <MoonIcon />, label: 'Dark' },
        { key: 'system', icon: <SystemIcon />, label: 'System' },
      ].map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => set(key)}
          title={label}
          className="p-1.5 rounded-md transition-all duration-200"
          style={theme === key
            ? { background: 'linear-gradient(135deg, #b8860b, #d4a017)', color: '#fff' }
            : { color: 'var(--text-muted)' }}>
          {icon}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ children, user, adminLinks, investorLinks }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = user?.role === 'admin' ? adminLinks : investorLinks

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={user?.role === 'admin' ? '/admin' : '/investor'} className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #b8860b, #d4a017)' }}>
              <span className="text-xs font-bold text-white">VM</span>
            </div>
            <span className="font-display text-sm font-bold hidden sm:block" style={{ color: 'var(--text-primary)' }}>
              Viral Mobitech
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks?.map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(href) ? 'nav-active' : ''
                }`}
                style={!isActive(href) ? { color: 'var(--text-secondary)' } : {}}>
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
              <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</span>
            </div>
            <button onClick={handleLogout}
              className="btn-ghost text-xs px-3 py-1.5 hidden sm:flex font-semibold">
              Sign Out
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}>
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            {navLinks?.map(({ href, label, icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${isActive(href) ? 'nav-active' : ''}`}
                style={!isActive(href) ? { color: 'var(--text-secondary)' } : {}}>
                <span>{icon}</span><span>{label}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
              <button onClick={handleLogout} className="btn-ghost text-xs px-3 py-1.5">Sign Out</button>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <footer className="border-t py-4 text-center text-xs font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Viral Mobitech — Investor Portal
      </footer>
    </div>
  )
}
