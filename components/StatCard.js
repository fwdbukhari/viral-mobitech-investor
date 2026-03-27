export default function StatCard({ label, value, sub, accent, icon, trend }) {
  return (
    <div className="stat-card card-hover" style={{ animationFillMode: 'both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: accent ? 'rgba(0,200,255,0.1)' : 'rgba(30,111,255,0.1)',
              border: '1px solid rgba(0,200,255,0.15)',
            }}>{icon}</div>
          )}
          <p className="label">{label}</p>
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
            color: trend >= 0 ? '#34d399' : '#f87171',
            background: trend >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${trend >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p style={{
        fontFamily: accent ? 'Orbitron, monospace' : 'Exo 2, sans-serif',
        fontSize: '1.6rem', fontWeight: 700, lineHeight: 1,
        color: accent ? '#00c8ff' : '#e8f4ff',
        textShadow: accent ? '0 0 20px rgba(0,200,255,0.4)' : 'none',
      }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#6a9abf', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}
