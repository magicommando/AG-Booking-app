import { useEffect, useState } from 'react';
import { useAppState } from '../../state/AppState';
import { getInvoices, payInvoice, updateInvoice } from '../../services/billingService';
import PaymentModal from './PaymentModal';
import InvoiceViewer from './InvoiceViewer';
import ReceiptViewer from './ReceiptViewer';
import './BillingPage.css';

export default function BillingPage() {
  const { token, role } = useAppState();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(false);
  const [editForm, setEditForm] = useState({ notes: '', total: '' });
  const [saveError, setSaveError] = useState('');

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

  function startEditing(invoice) {
    setSelectedInvoice(invoice);
    setEditingInvoice(true);
    setEditForm({
      notes: invoice?.notes || '',
      total: invoice?.total ?? ''
    });
    setSaveError('');
  }

  async function saveInvoiceEdits() {
    if (!token || !selectedInvoice) return;

    try {
      const response = await updateInvoice(token, selectedInvoice._id, {
        notes: editForm.notes,
        total: Number(editForm.total)
      });
      const updatedInvoice = response?.invoice || response;
      setInvoices((prev) => prev.map((invoice) => invoice._id === selectedInvoice._id ? updatedInvoice : invoice));
      setSelectedInvoice(updatedInvoice);
      setEditingInvoice(false);
      setSaveError('');
    } catch (err) {
      setSaveError(err.response?.data?.message || err.response?.data?.error || 'Unable to update invoice.');
    }
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
              {(role === 'client') && invoice.status !== 'paid' ? (
                <button className="billing-btn" onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}>Pay</button>
              ) : null}
              {(role === 'gunsmith' || role === 'admin') ? (
                <button className="billing-btn-secondary" onClick={() => startEditing(invoice)}>Edit</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {selectedInvoice ? (
        <div className="billing-section">
          {editingInvoice ? (
            <div className="billing-edit-card">
              <h3>Edit Invoice</h3>
              <label className="billing-edit-field">
                Notes
                <textarea value={editForm.notes} onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </label>
              <label className="billing-edit-field">
                Total
                <input type="number" min="0" step="0.01" value={editForm.total} onChange={(e) => setEditForm((prev) => ({ ...prev, total: e.target.value }))} />
              </label>
              {saveError ? <p className="billing-error">{saveError}</p> : null}
              <div className="billing-actions">
                <button className="billing-btn" onClick={saveInvoiceEdits}>Save</button>
                <button className="billing-btn-secondary" onClick={() => { setEditingInvoice(false); setSaveError(''); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <InvoiceViewer invoice={selectedInvoice} />
          )}
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
