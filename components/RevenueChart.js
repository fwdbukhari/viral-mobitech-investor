import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  const fmt = (v) => currency === 'PKR'
    ? `PKR ${Number(v).toLocaleString()}`
    : `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="rounded-xl border p-3 text-xs shadow-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', minWidth: 160 }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ months, currency = 'USD' }) {
  const data = months.map(m => ({
    name: m.month.replace(' 2024', ' \'24').replace(' 2025', ' \'25').replace(' 2026', ' \'26'),
    Income: currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome,
    Marketing: currency === 'PKR' ? m.balancePKR + Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing,
    Balance: currency === 'PKR' ? m.balancePKR : m.balance,
    'Investor Share': currency === 'PKR' ? m.investorSharePKR : m.investorShare,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false} tickLine={false}
          tickFormatter={v => currency === 'PKR'
            ? `${(v/1000).toFixed(0)}k`
            : `$${(v/1000).toFixed(0)}k`}
          width={42}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 8 }}
          iconType="circle" iconSize={7}
        />
        <Bar dataKey="Income" fill="#d4a853" fillOpacity={0.6} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Marketing" fill="#4b5580" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="Balance" stroke="#f0d080" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Investor Share" stroke="#34d399" strokeWidth={2} dot={false} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
