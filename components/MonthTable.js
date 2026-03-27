import { useState } from 'react'

function fmt(n, currency) {
  if (currency === 'PKR') return `PKR ${Number(n).toLocaleString()}`
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function downloadCSV(months, currency) {
  const headers = ['Month', 'Fiscal Year', 'Total Income', 'Total Marketing', 'Balance', 'Investor Share (30%)', 'Payment Status']
  const rows = months.map(m => [
    m.month, m.fiscalYear,
    currency === 'PKR' ? m.balancePKR + Math.round(m.totalMarketing * m.pkrRate) : m.totalIncome,
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
      currency === 'PKR' ? `PKR ${(m.balancePKR + Math.round(m.totalMarketing * m.pkrRate)).toLocaleString()}` : `$${m.totalIncome.toFixed(2)}`,
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

export default function MonthTable({ months, currency, isAdmin = false, onStatusChange }) {
  const [expanded, setExpanded] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? months : months.slice(-6).reverse()

  const thStyle = {
    padding: '10px 16px', textAlign: 'left',
    fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', fontWeight: 600,
    letterSpacing: '1px', textTransform: 'uppercase', color: '#6a9abf',
    borderBottom: '1px solid rgba(0,200,255,0.12)',
    background: 'rgba(4,15,46,0.6)', whiteSpace: 'nowrap',
  }
  const tdStyle = {
    padding: '12px 16px', borderBottom: '1px solid rgba(0,200,255,0.08)',
    fontFamily: 'Exo 2, sans-serif', fontSize: '0.85rem',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.78rem', color: '#6a9abf', letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
          Monthly Breakdown — {months.length} months
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => downloadCSV(months, currency)}>↓ CSV</button>
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => downloadPDF(months, currency)}>↓ PDF</button>
        </div>
      </div>

      <div style={{ borderRadius: 14, border: '1px solid rgba(0,200,255,0.15)', overflow: 'hidden' }}>
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
                      className="table-row-hover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpanded(isOpen ? null : m.id)}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: '#e8f4ff' }}>{m.month}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6a9abf', marginTop: 2 }}>{m.fiscalYear}</div>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#e8f4ff' }}>
                        {fmt(currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome, currency)}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#f87171' }}>
                        {fmt(currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing, currency)}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#e8f4ff', fontWeight: 600 }}>
                        {fmt(currency === 'PKR' ? m.balancePKR : m.balance, currency)}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#34d399', fontWeight: 700 }}>
                        {fmt(currency === 'PKR' ? m.investorSharePKR : m.investorShare, currency)}
                      </td>
                      <td style={tdStyle}>
                        {isAdmin ? (
                          <select
                            value={m.paymentStatus}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); onStatusChange && onStatusChange(m.id, e.target.value) }}
                            style={{
                              fontSize: '0.72rem', padding: '3px 8px', borderRadius: 50, cursor: 'pointer',
                              background: isReceived ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                              color: isReceived ? '#34d399' : '#fbbf24',
                              border: `1px solid ${isReceived ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                              fontFamily: 'Exo 2, sans-serif', fontWeight: 600,
                            }}>
                            <option value="Received">Received</option>
                            <option value="Pending">Pending</option>
                          </select>
                        ) : (
                          <span className={isReceived ? 'badge-received' : 'badge-pending'}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isReceived ? '#34d399' : '#fbbf24', display: 'inline-block' }} />
                            {m.paymentStatus}
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#6a9abf', fontSize: '0.7rem' }}>
                        {isOpen ? '▲' : '▼'}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`${m.id}-detail`}>
                        <td colSpan={7} style={{ padding: '16px', background: 'rgba(4,15,46,0.4)', borderBottom: '1px solid rgba(0,200,255,0.08)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                            {[
                              { label: 'Ads Revenue', value: fmt(currency === 'PKR' ? Math.round(m.adsRevenue * m.pkrRate) : m.adsRevenue, currency) },
                              { label: 'Subscriptions', value: fmt(currency === 'PKR' ? Math.round(m.subscriptions * m.pkrRate) : m.subscriptions, currency) },
                              { label: 'Adj Invalid Traffic', value: fmt(currency === 'PKR' ? Math.round(m.adjInvalidTraffic * m.pkrRate) : m.adjInvalidTraffic, currency) },
                              { label: 'Ads Spend', value: fmt(currency === 'PKR' ? Math.round(m.adsSpend * m.pkrRate) : m.adsSpend, currency) },
                              { label: 'Taxes', value: fmt(currency === 'PKR' ? Math.round(m.taxes * m.pkrRate) : m.taxes, currency) },
                              { label: 'USD Rate', value: `1 USD = PKR ${m.pkrRate}` },
                              { label: 'Net Balance', value: fmt(currency === 'PKR' ? m.balancePKR : m.balance, currency), cyan: true },
                              { label: 'Investor Share', value: fmt(currency === 'PKR' ? m.investorSharePKR : m.investorShare, currency), green: true },
                            ].map(({ label, value, cyan, green }) => (
                              <div key={label} style={{
                                padding: '10px 12px', borderRadius: 10,
                                background: 'rgba(7,21,69,0.5)', border: '1px solid rgba(0,200,255,0.12)',
                              }}>
                                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', color: '#6a9abf', marginBottom: 5, letterSpacing: 0.8 }}>{label}</p>
                                <p style={{
                                  fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700,
                                  color: cyan ? '#00c8ff' : green ? '#34d399' : '#e8f4ff',
                                  textShadow: cyan ? '0 0 12px rgba(0,200,255,0.4)' : 'none',
                                }}>{value}</p>
                              </div>
                            ))}
                          </div>
                          {m.receiptUrl && (
                            <a href={m.receiptUrl} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: '0.8rem', color: '#00c8ff', textDecoration: 'none' }}>
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

      {months.length > 6 && (
        <button onClick={() => setShowAll(!showAll)}
          style={{
            marginTop: 12, width: '100%', padding: '10px',
            background: 'transparent', border: '1px dashed rgba(0,200,255,0.2)',
            borderRadius: 10, color: '#6a9abf', fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: 'Exo 2, sans-serif', transition: '0.25s ease',
          }}>
          {showAll ? '▲ Show recent only' : `▼ Show all ${months.length} months`}
        </button>
      )}
    </div>
  )
}
