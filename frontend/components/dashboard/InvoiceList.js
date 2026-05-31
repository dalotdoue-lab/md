const InvoiceList = ({ invoices }) => {
  const defaultInvoices = [
    { id: 'INV-001', date: '2024-02-15', amount: '$15,000', status: 'paid', project: 'Smart Irrigation System' },
    { id: 'INV-002', date: '2024-02-01', amount: '$8,500', status: 'paid', project: 'AI Analytics Platform' },
    { id: 'INV-003', date: '2024-03-01', amount: '$12,000', status: 'pending', project: 'Building Automation' },
    { id: 'INV-004', date: '2024-03-15', amount: '$5,000', status: 'pending', project: 'Smart Irrigation Phase 2' },
  ]

  const displayInvoices = invoices || defaultInvoices

  const statusColors = {
    paid: { bg: 'bg-green-100', text: 'text-green-800' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    overdue: { bg: 'bg-red-100', text: 'text-red-800' },
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-heading font-bold text-let-blue">Recent Invoices</h3>
        <button className="text-let-blue hover:text-let-accent text-sm font-semibold">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-let-blue">{invoice.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{invoice.project}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{invoice.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}>
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



