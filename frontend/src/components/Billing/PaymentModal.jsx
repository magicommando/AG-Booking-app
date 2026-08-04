import { useState } from 'react';

export default function PaymentModal({ invoice, onClose, onPay }) {
  const [paymentMethod, setPaymentMethod] = useState('manual');

  if (!invoice) return null;

  return (
    <div className="billing-modal">
      <div className="billing-modal-card">
        <h3>Payment Modal</h3>
        <p>Invoice: {invoice.invoiceNumber}</p>
        <label>
          Payment Method
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="manual">Manual</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </label>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="billing-btn" onClick={() => onPay(invoice._id, { paymentMethod })}>Pay</button>
          <button className="billing-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
