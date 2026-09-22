const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

const withCustomer = (path, customerId) => `${path}?customer_id=${encodeURIComponent(customerId)}`;

export const customerApi = {
  login: (credentials) => request("/login", { method: "POST", body: JSON.stringify(credentials) }),
  profile: (customerId) => request(withCustomer("/customer-profile", customerId)),
  updateProfile: (customerId, profile) => request(`/customer-profile/${customerId}`, { method: "PUT", body: JSON.stringify(profile) }),
  subscriptions: (customerId) => request(withCustomer("/subscriptions", customerId)),
  updateSubscription: (customerId, subscriptionId, status) => request(`/subscriptions/${subscriptionId}/status`, { method: "PATCH", body: JSON.stringify({ customer_id: customerId, status }) }),
  subscribe: (payload) => request("/subscriptions", { method: "POST", body: JSON.stringify(payload) }),
  deliveries: (customerId) => request(withCustomer("/delivery-history", customerId)),
  payments: (customerId) => request(withCustomer("/payments", customerId)),
  requests: (customerId) => request(withCustomer("/requests", customerId)),
  createRequest: (payload) => request("/requests", { method: "POST", body: JSON.stringify(payload) }),
  notifications: (customerId) => request(withCustomer("/notifications", customerId)),
  markNotificationRead: (customerId, notificationId) => request(`/notifications/${notificationId}/read`, { method: "PATCH", body: JSON.stringify({ customer_id: customerId }) }),
  newspapers: (customerId) => request(withCustomer("/newspapers", customerId)),
};
