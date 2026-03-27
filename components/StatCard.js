export default function StatCard({ label, value, sub, accent, icon, trend }) {
  return (
    <div className="stat-card card-hover">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: accent ? 'rgba(0,200,255,0.12)' : 'rgba(30,111,255,0.12)',
              border: '1px solid rgba(0,200,255,0.2)',
            }}>{icon}</div>
          )}
          <p style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '1.2px', textTransform: 'uppercase',
            color: '#6a9abf', margin: 0,
          }}>{label}</p>
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
            color: trend >= 0 ? '#34d399' : '#f87171',
            background: trend >= 0 ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            border: `1px solid ${trend >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Main value — always bright white for readability */}
      <p style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '1.55rem', fontWeight: 700, lineHeight: 1.1,
        color: accent ? '#00c8ff' : '#ffffff',
        textShadow: accent
          ? '0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.2)'
          : '0 0 10px rgba(255,255,255,0.1)',
        margin: '6px 0 0',
      }}>{value}</p>

      {sub && (
        <p style={{ fontSize: '0.75rem', color: '#6a9abf', margin: '4px 0 0', fontFamily: 'Exo 2, sans-serif' }}>
          {sub}
        </p>
      )}
    </div>
  )
}
