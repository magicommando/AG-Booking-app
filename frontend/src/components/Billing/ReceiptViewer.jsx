export default function ReceiptViewer({ invoice }) {
  if (!invoice) return null;

  return (
    <div style={{ border: '1px solid #444', padding: 16, borderRadius: 8 }}>
      <h3>Receipt Viewer</h3>
      <p><strong>Receipt:</strong> {invoice.receipt?.receiptNumber || 'N/A'}</p>
      <p><strong>Paid via:</strong> {invoice.paymentMethod || 'N/A'}</p>
      <p><strong>Amount:</strong> ${invoice.total}</p>
      <p><strong>Note:</strong> {invoice.receipt?.note || 'No receipt note'}</p>
    </div>
  );
}
