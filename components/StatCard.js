export default function StatCard({ label, value, sub, accent, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: accent ? 'rgba(212,168,83,0.12)' : 'var(--bg-base)' }}>
              {icon}
            </div>
          )}
          <p className="label">{label}</p>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend >= 0
              ? 'text-emerald-400 bg-emerald-900/20'
              : 'text-red-400 bg-red-900/20'
          }`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold font-display leading-none ${accent ? 'gold-text' : ''}`}
        style={accent ? {} : { color: 'var(--text-primary)' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}
