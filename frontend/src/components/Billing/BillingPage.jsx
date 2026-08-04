import { useEffect, useState } from 'react';
import { useAppState } from '../../state/AppState';
import { getInvoices, payInvoice } from '../../services/billingService';
import PaymentModal from './PaymentModal';
import InvoiceViewer from './InvoiceViewer';
import ReceiptViewer from './ReceiptViewer';
import './BillingPage.css';

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
    <div className="billing-page">
      <h2>Billing</h2>
      <p className="billing-page-subtitle">Review invoices, payments, and receipts for your repair work.</p>
      {loading ? <p>Loading invoices...</p> : null}

      {!loading && invoices.length === 0 ? (
        <div className="billing-empty">
          No invoices yet. Create one from a work order or wait for the next repair to be billed.
        </div>
      ) : null}

      <div className="billing-list">
        {invoices.map((invoice) => (
          <div key={invoice._id} className="billing-card">
            <strong>{invoice.invoiceNumber}</strong>
            <p>Status: {invoice.status}</p>
            <p>Total: ${invoice.total}</p>
            <div className="billing-actions">
              <button className="billing-btn-secondary" onClick={() => setSelectedInvoice(invoice)}>View</button>
              {invoice.status !== 'paid' ? (
                <button className="billing-btn" onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}>Pay</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {selectedInvoice ? (
        <div className="billing-section">
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
