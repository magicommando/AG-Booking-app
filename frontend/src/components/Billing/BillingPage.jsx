import { useEffect, useState } from 'react';
import { useAppState } from '../../state/AppState';
import { getInvoices, payInvoice } from '../../services/billingService';
import PaymentModal from './PaymentModal';
import InvoiceViewer from './InvoiceViewer';
import ReceiptViewer from './ReceiptViewer';

export default function BillingPage() {
  const { token } = useAppState();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getInvoices(token);
        setInvoices(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handlePay(invoiceId, payload = {}) {
    if (!token) return;
    const response = await payInvoice(token, invoiceId, payload);
    setInvoices((prev) => prev.map((inv) => inv._id === invoiceId ? response.invoice : inv));
    setSelectedInvoice(response.invoice);
    setShowPaymentModal(false);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Billing</h2>
      {loading ? <p>Loading invoices...</p> : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {invoices.map((invoice) => (
          <div key={invoice._id} style={{ border: '1px solid #444', padding: 16, borderRadius: 8 }}>
            <strong>{invoice.invoiceNumber}</strong>
            <p>Status: {invoice.status}</p>
            <p>Total: ${invoice.total}</p>
            <button onClick={() => setSelectedInvoice(invoice)}>View</button>
            {invoice.status !== 'paid' ? (
              <button onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }} style={{ marginLeft: 8 }}>Pay</button>
            ) : null}
          </div>
        ))}
      </div>

      {selectedInvoice ? (
        <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
          <InvoiceViewer invoice={selectedInvoice} />
          {selectedInvoice.status === 'paid' ? <ReceiptViewer invoice={selectedInvoice} /> : null}
        </div>
      ) : null}

      {showPaymentModal ? (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setShowPaymentModal(false)}
          onPay={handlePay}
        />
      ) : null}
    </div>
  );
}
