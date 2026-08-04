import { useState } from 'react';

export default function PaymentModal({ invoice, onClose, onPay }) {
  const [paymentMethod, setPaymentMethod] = useState('manual');

  if (!invoice) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', padding: 24, borderRadius: 12, minWidth: 320 }}>
        <h3>Payment Modal</h3>
        <p>Invoice: {invoice.invoiceNumber}</p>
        <label>
          Payment Method
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ display: 'block', marginTop: 8, width: '100%' }}>
            <option value="manual">Manual</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </label>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => onPay(invoice._id, { paymentMethod })}>Pay</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
