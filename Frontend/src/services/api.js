const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:4002/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Request failed");
  }
  if (response.status === 204) return null;
  return response.json();
}

export const suppliersApi = {
  list() {
    return request("/suppliers");
  },
  create(supplier) {
    return request("/suppliers", { method: "POST", body: JSON.stringify(supplier) });
  },
  update(id, supplier) {
    return request(`/suppliers/${id}`, { method: "PUT", body: JSON.stringify(supplier) });
  },
  remove(id) {
    return request(`/suppliers/${id}`, { method: "DELETE" });
  },
};

export const inventoryApi = {
  list() {
    return request("/inventory");
  },
  create(item) {
    return request("/inventory", { method: "POST", body: JSON.stringify(item) });
  },
  update(id, item) {
    return request(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(item) });
  },
};

export const purchaseOrdersApi = {
  list() {
    return request("/purchase-orders");
  },
  create(po) {
    return request("/purchase-orders", { method: "POST", body: JSON.stringify(po) });
  },
  update(id, changes) {
    return request(`/purchase-orders/${id}`, { method: "PUT", body: JSON.stringify(changes) });
  },
};

export const deliveriesApi = {
  list() {
    return request("/deliveries");
  },
  update(purchaseOrderId, changes) {
    return request(`/deliveries/${purchaseOrderId}`, { method: "PUT", body: JSON.stringify(changes) });
  },
};

export const approvalsApi = {
  list() {
    return request("/approvals");
  },
  decide(decision) {
    return request("/approvals", { method: "POST", body: JSON.stringify(decision) });
  },
  bulkSubmit(purchaseOrderIds) {
    return request("/approvals/bulk", { method: "POST", body: JSON.stringify({ purchaseOrderIds }) });
  },
};

export const auditTrailApi = {
  list() {
    return request("/audit-trail");
  },
};

export const dashboardApi = {
  get() {
    return request("/dashboard");
  },
};
