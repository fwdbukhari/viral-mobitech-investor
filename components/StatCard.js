export default function StatCard({ label, value, sub, accent, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: accent ? 'rgba(184,134,11,0.12)' : 'var(--bg-base)' }}>
              {icon}
            </div>
          )}
          <p className="label">{label}</p>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'text-emerald-400 bg-emerald-50' : 'text-red-400 bg-red-50'
          }`}
          style={trend >= 0
            ? { background: 'rgba(5,150,105,0.1)' }
            : { background: 'rgba(220,38,38,0.1)' }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold font-display leading-none ${accent ? 'gold-text' : ''}`}
        style={accent ? {} : { color: 'var(--text-primary)' }}>
        {value}
      </p>
      {sub && <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}
