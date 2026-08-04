import { Link } from 'react-router-dom';

export default function BillingDashboardCard() {
  return (
    <div style={{ border: '1px solid rgba(201,168,106,0.25)', padding: 16, borderRadius: 12, background: 'rgba(20,20,20,0.78)' }}>
      <h3 style={{ color: '#c9a86a', marginTop: 0 }}>Billing</h3>
      <p style={{ color: '#e8dfc8' }}>Review invoices, payments, and receipts from one place.</p>
      <Link to="/billing" style={{ display: 'inline-block', marginTop: 8, padding: '8px 14px', borderRadius: 999, background: 'linear-gradient(135deg, #c9a86a, #8f6d3d)', color: '#111', fontWeight: 700, textDecoration: 'none' }}>Open Billing</Link>
    </div>
  );
}
