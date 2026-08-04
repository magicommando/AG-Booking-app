export default function InvoiceViewer({ invoice }) {
  if (!invoice) return null;

  return (
    <div style={{ border: '1px solid #444', padding: 16, borderRadius: 8 }}>
      <h3>Invoice Viewer</h3>
      <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
      <p><strong>Status:</strong> {invoice.status}</p>
      <p><strong>Total:</strong> ${invoice.total}</p>
      <ul>
        {(invoice.items || []).map((item, idx) => (
          <li key={`${item.description}-${idx}`}>{item.description} x {item.qty} — ${item.lineTotal}</li>
        ))}
      </ul>
    </div>
  );
}
