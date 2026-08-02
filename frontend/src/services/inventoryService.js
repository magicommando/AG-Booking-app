import api from './api';

function authConfig(token) {
	return token
		? { headers: { Authorization: `Bearer ${token}` } }
		: {};
}

export async function fetchInventoryItems(token) {
	const { data } = await api.get('/inventory', authConfig(token));
	return Array.isArray(data) ? data : [];
}

export async function fetchInventoryItemById(id, token) {
	const { data } = await api.get(`/inventory/${id}`, authConfig(token));
	return data;
}

export async function createInventoryItem(payload, token) {
	const { data } = await api.post('/inventory', payload, authConfig(token));
	return data;
}

export async function updateInventoryItem(id, payload, token) {
	const { data } = await api.put(`/inventory/${id}`, payload, authConfig(token));
	return data;
}

export async function deleteInventoryItem(id, token) {
	const { data } = await api.delete(`/inventory/${id}`, authConfig(token));
	return data;
}

export async function placeInventoryOrder(id, payload, token) {
	const { data } = await api.post(`/inventory/${id}/orders`, payload, authConfig(token));
	return data;
}
