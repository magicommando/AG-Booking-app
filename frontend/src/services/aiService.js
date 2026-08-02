import api from "./api";

export async function analyzeFirearm(token, payload) {
  const response = await api.post("/ai/firearm", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function scanInventory(token, payload) {
  const response = await api.post("/ai/inventory-scan", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function uploadPhoto(token, payload) {
  const response = await api.post("/ai/photo", payload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

export async function autoFillWorkOrder(token, payload) {
  const response = await api.post("/ai/work-order", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
