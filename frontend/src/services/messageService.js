import api from "./api";

function authHeaders(token) {
	return {
		headers: {
			Authorization: `Bearer ${token}`
		}
	};
}

export async function getConversations(token) {
	const response = await api.get("/messages/conversations", authHeaders(token));
	return response.data;
}

export async function getConversation(token, userId, otherUserId) {
	const response = await api.get(`/messages/${userId}/${otherUserId}`, authHeaders(token));
	return response.data;
}

export async function sendConversationMessage(token, payload) {
	const response = await api.post("/messages", payload, authHeaders(token));
	return response.data;
}
