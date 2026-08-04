import { Link } from 'react-router-dom';

export default function BillingDashboardCard() {
  return (
    <div style={{ border: '1px solid #444', padding: 16, borderRadius: 8 }}>
      <h3>Billing</h3>
      <p>Review invoices, payments, and receipts from one place.</p>
      <Link to="/billing">Open Billing</Link>
    </div>
  );
}
