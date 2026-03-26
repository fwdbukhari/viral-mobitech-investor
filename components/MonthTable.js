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
  const a = document.createElement('a')
  a.href = url
  a.download = `viral-mobitech-investor-report-${currency}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadPDF(months, currency) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(212, 168, 83)
  doc.text('Viral Mobitech', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 140)
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
    headStyles: { fillColor: [17, 21, 32], textColor: [212, 168, 83], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [22, 27, 40] },
    bodyStyles: { fillColor: [17, 21, 32], textColor: [200, 205, 220] },
    columnStyles: {
      5: { textColor: [52, 211, 153] },
      6: { textColor: (cell) => cell.raw === 'Received' ? [52, 211, 153] : [251, 191, 36] },
    },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(100)
    doc.text(`Page ${i} of ${pageCount} — Viral Mobitech Investor Portal`, 14, doc.internal.pageSize.height - 8)
  }

  doc.save(`viral-mobitech-investor-report-${currency}.pdf`)
}

export default function MonthTable({ months, currency, isAdmin = false, onStatusChange }) {
  const [expanded, setExpanded] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll ? months : months.slice(-6).reverse()

  return (
    <div>
      {/* Download buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Monthly Breakdown — {months.length} months
        </h2>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => downloadCSV(months, currency)}>
            ↓ CSV
          </button>
          <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => downloadPDF(months, currency)}>
            ↓ PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                {['Month', 'Total Income', 'Marketing', 'Balance', 'Your Share (30%)', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
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
                      className="border-b table-row-hover cursor-pointer transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                      onClick={() => setExpanded(isOpen ? null : m.id)}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        <div>{m.month}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.fiscalYear}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {fmt(currency === 'PKR' ? Math.round(m.totalIncome * m.pkrRate) : m.totalIncome, currency)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-red-400">
                        {fmt(currency === 'PKR' ? Math.round(m.totalMarketing * m.pkrRate) : m.totalMarketing, currency)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                        {fmt(currency === 'PKR' ? m.balancePKR : m.balance, currency)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm font-semibold text-emerald-400">
                        {fmt(currency === 'PKR' ? m.investorSharePKR : m.investorShare, currency)}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <select
                            value={m.paymentStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => { e.stopPropagation(); onStatusChange && onStatusChange(m.id, e.target.value) }}
                            className={`text-xs rounded-full px-2 py-0.5 border cursor-pointer ${
                              isReceived
                                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
                                : 'bg-amber-900/30 text-amber-400 border-amber-800/50'
                            }`}
                            style={{ background: isReceived ? undefined : undefined }}>
                            <option value="Received">Received</option>
                            <option value="Pending">Pending</option>
                          </select>
                        ) : (
                          <span className={isReceived ? 'badge-received' : 'badge-pending'}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isReceived ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {m.paymentStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${m.id}-detail`} className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Ads Revenue', value: fmt(currency === 'PKR' ? Math.round(m.adsRevenue * m.pkrRate) : m.adsRevenue, currency) },
                              { label: 'Subscriptions', value: fmt(currency === 'PKR' ? Math.round(m.subscriptions * m.pkrRate) : m.subscriptions, currency) },
                              { label: 'Adj Invalid Traffic', value: fmt(currency === 'PKR' ? Math.round(m.adjInvalidTraffic * m.pkrRate) : m.adjInvalidTraffic, currency) },
                              { label: 'Ads Spend', value: fmt(currency === 'PKR' ? Math.round(m.adsSpend * m.pkrRate) : m.adsSpend, currency) },
                              { label: 'Taxes', value: fmt(currency === 'PKR' ? Math.round(m.taxes * m.pkrRate) : m.taxes, currency) },
                              { label: 'USD Rate', value: `1 USD = PKR ${m.pkrRate}` },
                              { label: 'Net Balance', value: fmt(currency === 'PKR' ? m.balancePKR : m.balance, currency), highlight: true },
                              { label: 'Your 30% Share', value: fmt(currency === 'PKR' ? m.investorSharePKR : m.investorShare, currency), accent: true },
                            ].map(({ label, value, highlight, accent }) => (
                              <div key={label} className="rounded-lg p-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                <p className={`text-sm font-mono font-semibold ${accent ? 'text-emerald-400' : highlight ? 'gold-text' : ''}`}
                                  style={!accent && !highlight ? { color: 'var(--text-primary)' } : {}}>
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                          {m.receiptUrl && (
                            <a href={m.receiptUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 text-xs text-gold-400 hover:text-gold-300">
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
          className="mt-3 w-full text-center text-xs py-2 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
          {showAll ? '▲ Show recent only' : `▼ Show all ${months.length} months`}
        </button>
      )}
    </div>
  )
}
