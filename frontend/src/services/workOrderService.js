import api from './api';

function authConfig(token) {
	return token
		? { headers: { Authorization: `Bearer ${token}` } }
		: {};
}

export async function fetchWorkOrders(token) {
	const { data } = await api.get('/workorders', authConfig(token));
	return data;
}

export async function fetchGunsmithAppointments(gunsmithId, token) {
	const { data } = await api.get(`/appointments/gunsmith/${gunsmithId}`, authConfig(token));
	return data;
}

export async function createWorkOrder(payload, token) {
	const { data } = await api.post('/workorders', payload, authConfig(token));
	return data;
}

export async function fetchWorkOrderById(id, token) {
	const { data } = await api.get(`/workorders/${id}`, authConfig(token));
	return data;
}

export async function updateWorkOrder(id, payload, token) {
	const { data } = await api.put(`/workorders/${id}`, payload, authConfig(token));
	return data;
}

export async function completeWorkOrder(id, token, payload = {}) {
	const { data } = await api.put(`/workorders/${id}/complete`, payload, authConfig(token));
	return data;
}
