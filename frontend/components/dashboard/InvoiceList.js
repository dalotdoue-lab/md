const InvoiceList = ({ invoices }) => {
  const defaultInvoices = [
    { id: 'INV-001', date: '2024-02-15', amount: '$15,000', status: 'paid', project: 'Smart Irrigation System' },
    { id: 'INV-002', date: '2024-02-01', amount: '$8,500', status: 'paid', project: 'AI Analytics Platform' },
    { id: 'INV-003', date: '2024-03-01', amount: '$12,000', status: 'pending', project: 'Building Automation' },
    { id: 'INV-004', date: '2024-03-15', amount: '$5,000', status: 'pending', project: 'Smart Irrigation Phase 2' },
  ]

  const displayInvoices = invoices || defaultInvoices

  const statusColors = {
    paid: { bg: 'bg-olive/15', text: 'text-olive-deep' },
    pending: { bg: 'bg-clay/15', text: 'text-clay-deep' },
    overdue: { bg: 'bg-clay-deep/15', text: 'text-clay-deep' },
  }

  return (
    <div className="bg-paper border border-line shadow-card rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-line flex justify-between items-center">
        <h3 className="text-lg font-heading text-ink">Recent invoices</h3>
        <button className="text-olive-deep hover:text-ink text-sm font-semibold">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bone">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-label">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-label">Project</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-label">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-label">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-label">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {displayInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-bone">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-ink">{invoice.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-ink-soft">{invoice.project}</td>
                <td className="px-6 py-4 whitespace-nowrap text-ink-soft">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-ink">{invoice.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InvoiceList



