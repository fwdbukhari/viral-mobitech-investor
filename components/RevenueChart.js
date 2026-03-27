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
    <div style={{
      background: 'rgba(4,15,46,0.95)',
      border: '1px solid rgba(0,200,255,0.25)',
      borderRadius: 10,
      padding: '12px 16px',
      backdropFilter: 'blur(10px)',
      minWidth: 160,
    }}>
      <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', color: '#00c8ff', marginBottom: 8, letterSpacing: 0.5 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#6a9abf' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8f4ff' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ months, currency = 'USD' }) {
  const data = months.map(m => ({
    name: m.month.replace(' 2024', " '24").replace(' 2025', " '25").replace(' 2026', " '26"),
    Income: currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome,
    Marketing: currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing,
    Balance: currency === 'PKR' ? m.balancePKR : m.balance,
    'Investor Share': currency === 'PKR' ? m.investorSharePKR : m.investorShare,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,255,0.08)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6a9abf', fontFamily: 'Exo 2' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 9, fill: '#6a9abf', fontFamily: 'Exo 2' }}
          axisLine={false} tickLine={false} width={44}
          tickFormatter={v => currency === 'PKR' ? `${(v/1000).toFixed(0)}k` : `$${(v/1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#6a9abf', fontFamily: 'Exo 2', paddingTop: 8 }} iconType="circle" iconSize={7} />
        <Bar dataKey="Income" fill="#1e6fff" fillOpacity={0.6} radius={[3,3,0,0]} />
        <Bar dataKey="Marketing" fill="#071545" fillOpacity={0.9} radius={[3,3,0,0]} stroke="rgba(0,200,255,0.2)" strokeWidth={1} />
        <Line type="monotone" dataKey="Balance" stroke="#00c8ff" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Investor Share" stroke="#34d399" strokeWidth={2} dot={false} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
