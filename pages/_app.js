import '../styles/globals.css'
import { useEffect, useState } from 'react'

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light-mode')
  } else if (theme === 'dark') {
    root.classList.remove('light-mode')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.remove('light-mode')
    else root.classList.add('light-mode')
  }
  localStorage.setItem('vm_theme', theme)
}

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('vm_theme') || 'dark'
    applyTheme(saved)
    setMounted(true)
  }, [])

  if (!mounted) return null
  return <Component {...pageProps} />
}
