import '../styles/globals.css'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply saved theme on load
    const savedTheme = localStorage.getItem('vm_theme') || 'dark'
    applyTheme(savedTheme)
  }, [])

  if (!mounted) return null

  return <Component {...pageProps} />
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
  localStorage.setItem('vm_theme', theme)
}
