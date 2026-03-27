import { useTheme } from '../lib/theme'

export default function StatCard({ label, value, sub, accent, icon, trend }) {
  const { c } = useTheme()

  return (
    <div className="stat-card card-hover">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <div style={{
              width: 32, height: 32, borderRadius: 8, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accent ? 'rgba(0,200,255,0.1)' : 'rgba(30,111,255,0.1)',
              border: `1px solid ${accent ? 'rgba(0,200,255,0.2)' : 'rgba(30,111,255,0.2)'}`,
            }}>{icon}</div>
          )}
          <p className="label">{label}</p>
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
            color: trend >= 0 ? c.green : c.red,
            background: trend >= 0 ? `${c.green}18` : `${c.red}18`,
            border: `1px solid ${trend >= 0 ? `${c.green}40` : `${c.red}40`}`,
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      <p style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.15,
        color: accent ? c.cyan : c.textPrimary,
        textShadow: accent ? `0 0 20px ${c.cyan}66` : 'none',
        margin: '6px 0 0',
      }}>{value}</p>

      {sub && (
        <p style={{ fontSize: '0.75rem', color: c.textMuted, margin: '4px 0 0', fontFamily: 'Exo 2, sans-serif' }}>
          {sub}
        </p>
      )}
    </div>
  )
}
