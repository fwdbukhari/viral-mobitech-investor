import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Always dark — brand is dark blue tech
    document.documentElement.classList.add('dark')
  }, [])
  return <Component {...pageProps} />
}
