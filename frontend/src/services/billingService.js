import api from './api';

export async function createInvoice(token, payload) {
  const { data } = await api.post('/billing/create-invoice', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function updateInvoice(token, id, payload) {
  const { data } = await api.put(`/billing/update-invoice/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function getInvoices(token) {
  const { data } = await api.get('/billing/get-invoices', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function payInvoice(token, id, payload = {}) {
  const { data } = await api.post(`/billing/pay/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function addPart(token, id, payload) {
  const { data } = await api.post(`/billing/add-part/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function addLabor(token, id, payload) {
  const { data } = await api.post(`/billing/add-labor/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}
