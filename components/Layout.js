import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { applyTheme } from '../pages/_app'
import { useTheme } from '../lib/theme'

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
const SunIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const SystemIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)

function ThemeSwitcher({ c }) {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const saved = localStorage.getItem('vm_theme') || 'dark'
    setTheme(saved)
  }, [])

  const set = (t) => { setTheme(t); applyTheme(t) }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, padding: 4,
      borderRadius: 8, border: `1px solid ${c.cardBorder}`,
      background: c.cardBg, backdropFilter: 'blur(8px)',
    }}>
      {[
        { key: 'light', icon: <SunIcon />, label: 'Light' },
        { key: 'dark', icon: <MoonIcon />, label: 'Dark' },
        { key: 'system', icon: <SystemIcon />, label: 'System' },
      ].map(({ key, icon, label }) => (
        <button key={key} onClick={() => set(key)} title={label}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer',
            transition: '0.2s ease',
            background: theme === key ? 'linear-gradient(135deg, #1e6fff, #00c8ff)' : 'transparent',
            color: theme === key ? '#fff' : c.textMuted,
            boxShadow: theme === key ? '0 0 10px rgba(0,200,255,0.3)' : 'none',
          }}>
          {icon}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ children, user, adminLinks, investorLinks }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { c } = useTheme()
  const navLinks = user?.role === 'admin' ? adminLinks : investorLinks

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (href) =>
    router.pathname === href ||
    (href !== '/admin' && href !== '/investor' && router.pathname.startsWith(href + '/'))

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <header style={{
        position: 'sticky', top: 0, zIndex: 40, height: 72,
        background: c.navBg,
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${c.navBorder}`,
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          <Link href={user?.role === 'admin' ? '/admin' : '/investor'}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            {/* Logo image has its own bg — display directly, no wrapper */}
            <img
              src={c.isLight ? '/logo-light.png' : '/logo-dark.png'}
              alt="Viral Mobitech"
              style={{
                width: 38, height: 38,
                borderRadius: 8,
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: c.isLight
                  ? '0 2px 8px rgba(30,111,255,0.18)'
                  : '0 0 14px rgba(0,200,255,0.28)',
              }}
            />
            <div className="hidden sm:block">
              <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.95rem', color: c.textPrimary }}>
                Viral<span style={{ color: c.cyan }}>Mobitech</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks?.map(({ href, label, icon }) => (
              <Link key={href} href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 8,
                  fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                  letterSpacing: '0.3px', textDecoration: 'none',
                  color: isActive(href) ? c.cyan : c.textMuted,
                  background: isActive(href) ? `${c.cyan}18` : 'transparent',
                  border: isActive(href) ? `1px solid ${c.cyan}33` : '1px solid transparent',
                  transition: '0.25s ease',
                }}>
                <span>{icon}</span><span>{label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <ThemeSwitcher c={c} />
            <div className="hidden sm:flex flex-col items-end">
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', fontWeight: 700, color: c.textPrimary, letterSpacing: 0.5 }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
                {user?.role}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-ghost hidden sm:inline-flex"
              style={{ padding: '7px 16px', fontSize: '0.78rem' }}>
              Sign Out
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden"
              style={{ color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{ borderTop: `1px solid ${c.navBorder}`, background: c.navBg, padding: '12px 24px 16px' }}>
            {navLinks?.map(({ href, label, icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                  fontFamily: 'Exo 2, sans-serif', fontSize: '0.9rem', fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive(href) ? c.cyan : c.textMuted,
                  background: isActive(href) ? `${c.cyan}18` : 'transparent',
                }}>
                <span>{icon}</span><span>{label}</span>
              </Link>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.navBorder}` }}>
              <ThemeSwitcher c={c} />
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Sign Out</button>
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '28px 24px' }}>
        {children}
      </main>

      <footer style={{ borderTop: `1px solid ${c.navBorder}`, padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', color: c.textMuted, fontFamily: 'Exo 2, sans-serif' }}>
        © {new Date().getFullYear()} Viral Mobitech — Investor Portal
      </footer>
    </div>
  )
}
