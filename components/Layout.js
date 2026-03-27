import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

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

export default function Layout({ children, user, adminLinks, investorLinks }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
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
      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        height: 72,
        background: 'rgba(1, 10, 30, 0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,200,255,0.18)',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          {/* Logo */}
          <Link href={user?.role === 'admin' ? '/admin' : '/investor'}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #1e6fff, #00c8ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0,200,255,0.35)',
            }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 12, color: '#fff', letterSpacing: 0 }}>VM</span>
            </div>
            <div className="hidden sm:block">
              <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.95rem', color: '#e8f4ff' }}>
                Viral<span style={{ color: '#00c8ff' }}>Mobitech</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks?.map(({ href, label, icon }) => (
              <Link key={href} href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 8,
                  fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                  letterSpacing: '0.3px', textDecoration: 'none',
                  color: isActive(href) ? '#00c8ff' : '#6a9abf',
                  background: isActive(href) ? 'rgba(0,200,255,0.1)' : 'transparent',
                  border: isActive(href) ? '1px solid rgba(0,200,255,0.2)' : '1px solid transparent',
                  transition: '0.25s ease',
                }}
                onMouseEnter={e => { if (!isActive(href)) e.currentTarget.style.color = '#e8f4ff' }}
                onMouseLeave={e => { if (!isActive(href)) e.currentTarget.style.color = '#6a9abf' }}>
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div className="hidden sm:flex flex-col items-end">
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', fontWeight: 700, color: '#e8f4ff', letterSpacing: 0.5 }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#6a9abf', textTransform: 'uppercase', letterSpacing: 1 }}>
                {user?.role}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-ghost hidden sm:inline-flex"
              style={{ padding: '7px 18px', fontSize: '0.78rem' }}>
              Sign Out
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden"
              style={{ color: '#6a9abf', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(0,200,255,0.18)',
            background: 'rgba(1,10,30,0.97)',
            padding: '12px 24px 16px',
          }}>
            {navLinks?.map(({ href, label, icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                  fontFamily: 'Exo 2, sans-serif', fontSize: '0.9rem', fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive(href) ? '#00c8ff' : '#6a9abf',
                  background: isActive(href) ? 'rgba(0,200,255,0.1)' : 'transparent',
                }}>
                <span>{icon}</span><span>{label}</span>
              </Link>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,200,255,0.12)' }}>
              <span style={{ fontSize: '0.85rem', color: '#6a9abf' }}>{user?.name}</span>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Sign Out</button>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '28px 24px' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid rgba(0,200,255,0.1)', padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', color: '#6a9abf', fontFamily: 'Exo 2, sans-serif' }}>
        © {new Date().getFullYear()} Viral Mobitech — Investor Portal
      </footer>
    </div>
  )
}
