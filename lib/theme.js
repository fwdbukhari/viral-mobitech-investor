import { useState, useEffect } from 'react'

// Returns current theme and color tokens that adapt automatically
export function useTheme() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    function check() {
      setIsLight(document.documentElement.classList.contains('light-mode'))
    }
    check()
    // Watch for class changes
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const c = isLight ? {
    // ── Light mode colors ──
    pageBg:       'linear-gradient(160deg, #eef2ff 0%, #e8f0fe 50%, #f0f4ff 100%)',
    cardBg:       'rgba(255,255,255,0.92)',
    cardBorder:   'rgba(30,111,255,0.14)',
    navBg:        'rgba(240,245,255,0.95)',
    navBorder:    'rgba(30,111,255,0.18)',
    textPrimary:  '#0d1033',
    textSub:      '#3a4570',
    textMuted:    '#6070a0',
    inputBg:      'rgba(235,242,255,0.8)',
    inputBorder:  'rgba(30,111,255,0.2)',
    inputColor:   '#0d1033',
    accent:       '#1e6fff',
    cyan:         '#0099cc',       // darker cyan for light bg
    green:        '#059669',
    red:          '#dc2626',
    amber:        '#b45309',
    white:        '#0d1033',       // "white text" = dark in light mode
    rowHover:     'rgba(30,111,255,0.04)',
    detailBg:     'rgba(230,240,255,0.5)',
    detailCard:   'rgba(255,255,255,0.8)',
    badgeGreenBg: 'rgba(5,150,105,0.1)',
    badgeGreenBorder: 'rgba(5,150,105,0.3)',
    badgeGreenColor: '#065f46',
    badgeAmberBg: 'rgba(180,83,9,0.08)',
    badgeAmberBorder: 'rgba(180,83,9,0.25)',
    badgeAmberColor: '#7c3500',
    gridOverlay:  'none',
    shadow:       '0 2px 16px rgba(30,111,255,0.08)',
  } : {
    // ── Dark mode colors ──
    pageBg:       'linear-gradient(160deg, #010a1e 0%, #040f2e 50%, #010d1f 100%)',
    cardBg:       'rgba(7,21,69,0.55)',
    cardBorder:   'rgba(0,200,255,0.18)',
    navBg:        'rgba(1,10,30,0.88)',
    navBorder:    'rgba(0,200,255,0.18)',
    textPrimary:  '#ffffff',
    textSub:      '#c8d8f0',
    textMuted:    '#6a9abf',
    inputBg:      'rgba(7,21,69,0.6)',
    inputBorder:  'rgba(0,200,255,0.18)',
    inputColor:   '#e8f4ff',
    accent:       '#1e6fff',
    cyan:         '#00c8ff',
    green:        '#34d399',
    red:          '#ff7070',
    amber:        '#fbbf24',
    white:        '#ffffff',
    rowHover:     'rgba(0,200,255,0.04)',
    detailBg:     'rgba(1,10,30,0.6)',
    detailCard:   'rgba(7,21,69,0.6)',
    badgeGreenBg: 'rgba(52,211,153,0.12)',
    badgeGreenBorder: 'rgba(52,211,153,0.35)',
    badgeGreenColor: '#34d399',
    badgeAmberBg: 'rgba(251,191,36,0.12)',
    badgeAmberBorder: 'rgba(251,191,36,0.35)',
    badgeAmberColor: '#fbbf24',
    gridOverlay:  'block',
    shadow:       'none',
  }

  return { isLight, c }
}
