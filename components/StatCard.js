import { useTheme } from '../lib/theme'

export default function StatCard({ label, value, sub, accent, icon, trend }) {
  const { c } = useTheme()

  return (
    <div className="stat-card card-hover">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <div style={{
              width: 30, height: 30, borderRadius: 8, fontSize: 13, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accent ? 'rgba(0,200,255,0.1)' : 'rgba(30,111,255,0.1)',
              border: `1px solid ${accent ? 'rgba(0,200,255,0.2)' : 'rgba(30,111,255,0.2)'}`,
            }}>{icon}</div>
          )}
          <p className="label" style={{ margin: 0 }}>{label}</p>
        </div>

        {/* Fix 2: trend badge — compact, fixed height, no overflow */}
        {trend !== undefined && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px',
            height: 22,
            borderRadius: 50,
            fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
            color: trend >= 0 ? c.green : c.red,
            background: trend >= 0 ? `${c.green}18` : `${c.red}18`,
            border: `1px solid ${trend >= 0 ? `${c.green}40` : `${c.red}40`}`,
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Main value */}
      <p style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.15,
        color: accent ? c.cyan : c.textPrimary,
        textShadow: accent ? `0 0 20px ${c.cyan}55` : 'none',
        margin: '8px 0 0',
      }}>{value}</p>

      {/* Sub text */}
      {sub && (
        <p style={{ fontSize: '0.75rem', color: c.textMuted, margin: '4px 0 0', fontFamily: 'Exo 2, sans-serif' }}>
          {sub}
        </p>
      )}
    </div>
  )
}
