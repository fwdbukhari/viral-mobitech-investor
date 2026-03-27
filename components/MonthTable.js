import { useState } from 'react'

function fmt(n, currency) {
  if (currency === 'PKR') return `PKR ${Number(n).toLocaleString()}`
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function downloadCSV(months, currency) {
  const headers = ['Month', 'Fiscal Year', 'Total Income', 'Total Marketing', 'Balance', 'Investor Share (30%)', 'Payment Status']
  const rows = months.map(m => [
    m.month, m.fiscalYear,
    currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome,
    currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing,
    currency === 'PKR' ? m.balancePKR : m.balance,
    currency === 'PKR' ? m.investorSharePKR : m.investorShare,
    m.paymentStatus,
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `vm-investor-report.csv`; a.click()
  URL.revokeObjectURL(url)
}

async function downloadPDF(months, currency) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(0, 200, 255)
  doc.text('Viral Mobitech', 14, 16)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(106, 154, 191)
  doc.text('Investor Report — All Months', 14, 23)
  doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Currency: ${currency}`, 14, 29)

  autoTable(doc, {
    startY: 35,
    head: [['Month', 'Fiscal Year', 'Total Income', 'Marketing', 'Net Balance', 'Investor Share', 'Status']],
    body: months.map(m => [
      m.month, m.fiscalYear,
      currency === 'PKR' ? `PKR ${Math.round(m.totalIncome * m.pkrRate).toLocaleString()}` : `$${m.totalIncome.toFixed(2)}`,
      currency === 'PKR' ? `PKR ${Math.round(m.totalMarketing * m.pkrRate).toLocaleString()}` : `$${m.totalMarketing.toFixed(2)}`,
      currency === 'PKR' ? `PKR ${m.balancePKR.toLocaleString()}` : `$${m.balance.toFixed(2)}`,
      currency === 'PKR' ? `PKR ${m.investorSharePKR.toLocaleString()}` : `$${m.investorShare.toFixed(2)}`,
      m.paymentStatus,
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [7, 21, 69], textColor: [0, 200, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [4, 15, 46] },
    bodyStyles: { fillColor: [1, 10, 30], textColor: [232, 244, 255] },
  })

  const pc = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i); doc.setFontSize(7); doc.setTextColor(100)
    doc.text(`Page ${i} of ${pc} — Viral Mobitech Investor Portal`, 14, doc.internal.pageSize.height - 8)
  }
  doc.save(`vm-investor-report-${currency}.pdf`)
}

// Consistent text styles
const COL_WHITE = '#ffffff'
const COL_MUTED = '#8ab4d4'
const COL_RED   = '#ff7070'
const COL_GREEN = '#34d399'
const COL_CYAN  = '#00c8ff'

export default function MonthTable({ months, currency, isAdmin = false, onStatusChange }) {
  const [expanded, setExpanded] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? months : months.slice(-6).reverse()

  const thStyle = {
    padding: '10px 16px', textAlign: 'left',
    fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', fontWeight: 600,
    letterSpacing: '1px', textTransform: 'uppercase', color: '#6a9abf',
    borderBottom: '1px solid rgba(0,200,255,0.15)',
    background: 'rgba(1,10,30,0.8)', whiteSpace: 'nowrap',
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', color: '#6a9abf', letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
          Monthly Breakdown — {months.length} months
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => downloadCSV(months, currency)}>↓ CSV</button>
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => downloadPDF(months, currency)}>↓ PDF</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 14, border: '1px solid rgba(0,200,255,0.18)', overflow: 'hidden' }}>
        <div className="overflow-x-auto scrollbar-thin">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Month', 'Total Income', 'Marketing', 'Balance', 'Your Share (30%)', 'Status', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((m) => {
                const isOpen = expanded === m.id
                const isReceived = m.paymentStatus === 'Received'

                return (
                  <>
                    <tr key={m.id}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,200,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setExpanded(isOpen ? null : m.id)}>

                      {/* Month */}
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,200,255,0.07)' }}>
                        <div style={{ fontFamily: 'Exo 2, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: COL_WHITE }}>
                          {m.month}
                        </div>
                        <div style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '0.7rem', color: COL_MUTED, marginTop: 2 }}>
                          {m.fiscalYear}
                        </div>
                      </td>

                      {/* Total Income */}
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,200,255,0.07)', fontFamily: '"Exo 2", monospace', fontSize: '0.88rem', fontWeight: 600, color: COL_WHITE }}>
                        {fmt(currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome, currency)}
                      </td>

                      {/* Marketing */}
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,200,255,0.07)', fontFamily: '"Exo 2", monospace', fontSize: '0.88rem', fontWeight: 600, color: COL_RED }}>
                        {fmt(currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing, currency)}
                      </td>

                      {/* Balance */}
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,200,255,0.07)', fontFamily: '"Exo 2", monospace', fontSize: '0.88rem', fontWeight: 700, color: COL_WHITE }}>
                        {fmt(currency === 'PKR' ? m.balancePKR : m.balance, currency)}
                      </td>

                      {/* Investor Share */}
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,200,255,0.07)', fontFamily: 'Orbitron, monospace', fontSize: '0.85rem', fontWeight: 700, color: COL_GREEN }}>
                        {fmt(currency === 'PKR' ? m.investorSharePKR : m.investorShare, currency)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,200,255,0.07)' }}>
                        {isAdmin ? (
                          <select
                            value={m.paymentStatus}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); onStatusChange && onStatusChange(m.id, e.target.value) }}
                            style={{
                              fontSize: '0.75rem', padding: '4px 10px', borderRadius: 50, cursor: 'pointer',
                              background: isReceived ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                              color: isReceived ? COL_GREEN : '#fbbf24',
                              border: `1px solid ${isReceived ? 'rgba(52,211,153,0.35)' : 'rgba(251,191,36,0.35)'}`,
                              fontFamily: 'Exo 2, sans-serif', fontWeight: 700, outline: 'none',
                            }}>
                            <option value="Received">Received</option>
                            <option value="Pending">Pending</option>
                          </select>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 50,
                            fontSize: '0.75rem', fontWeight: 700,
                            background: isReceived ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                            color: isReceived ? COL_GREEN : '#fbbf24',
                            border: `1px solid ${isReceived ? 'rgba(52,211,153,0.35)' : 'rgba(251,191,36,0.35)'}`,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isReceived ? COL_GREEN : '#fbbf24', display: 'inline-block' }} />
                            {m.paymentStatus}
                          </span>
                        )}
                      </td>

                      {/* Expand arrow */}
                      <td style={{ padding: '13px 12px', borderBottom: '1px solid rgba(0,200,255,0.07)', textAlign: 'center', color: '#4a7aaa', fontSize: '0.65rem' }}>
                        {isOpen ? '▲' : '▼'}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isOpen && (
                      <tr key={`${m.id}-detail`}>
                        <td colSpan={7} style={{ padding: '16px 20px', background: 'rgba(1,10,30,0.6)', borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                            {[
                              { label: 'Ads Revenue', value: fmt(currency === 'PKR' ? Math.round(m.adsRevenue * m.pkrRate) : m.adsRevenue, currency), color: COL_WHITE },
                              { label: 'Subscriptions', value: fmt(currency === 'PKR' ? Math.round(m.subscriptions * m.pkrRate) : m.subscriptions, currency), color: COL_WHITE },
                              { label: 'Adj Invalid Traffic', value: fmt(currency === 'PKR' ? Math.round(m.adjInvalidTraffic * m.pkrRate) : m.adjInvalidTraffic, currency), color: COL_RED },
                              { label: 'Ads Spend', value: fmt(currency === 'PKR' ? Math.round(m.adsSpend * m.pkrRate) : m.adsSpend, currency), color: COL_RED },
                              { label: 'Taxes', value: fmt(currency === 'PKR' ? Math.round(m.taxes * m.pkrRate) : m.taxes, currency), color: COL_RED },
                              { label: 'USD Rate', value: `1 USD = PKR ${m.pkrRate}`, color: COL_MUTED },
                              { label: 'Net Balance', value: fmt(currency === 'PKR' ? m.balancePKR : m.balance, currency), color: COL_CYAN },
                              { label: 'Investor Share', value: fmt(currency === 'PKR' ? m.investorSharePKR : m.investorShare, currency), color: COL_GREEN },
                            ].map(({ label, value, color }) => (
                              <div key={label} style={{
                                padding: '10px 12px', borderRadius: 10,
                                background: 'rgba(7,21,69,0.6)', border: '1px solid rgba(0,200,255,0.12)',
                              }}>
                                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.56rem', color: '#6a9abf', marginBottom: 5, letterSpacing: 0.8 }}>{label}</p>
                                <p style={{
                                  fontFamily: 'Exo 2, monospace', fontSize: '0.9rem', fontWeight: 700,
                                  color,
                                  textShadow: color === COL_CYAN ? '0 0 12px rgba(0,200,255,0.4)' : 'none',
                                  margin: 0,
                                }}>{value}</p>
                              </div>
                            ))}
                          </div>
                          {m.receiptUrl && (
                            <a href={m.receiptUrl} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: '0.8rem', color: COL_CYAN, textDecoration: 'none' }}>
                              🔗 View Receipt / Proof
                            </a>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show all toggle */}
      {months.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            marginTop: 12, width: '100%', padding: '10px',
            background: 'transparent', border: '1px dashed rgba(0,200,255,0.2)',
            borderRadius: 10, color: '#6a9abf', fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: 'Exo 2, sans-serif',
            transition: '0.25s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.45)'; e.currentTarget.style.color = '#00c8ff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.2)'; e.currentTarget.style.color = '#6a9abf' }}>
          {showAll ? '▲ Show recent only' : `▼ Show all ${months.length} months`}
        </button>
      )}
    </div>
  )
}
