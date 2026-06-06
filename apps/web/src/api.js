const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha na requisição.");
    error.payload = data;
    throw error;
  }

  return data;
}

export const incidentApi = {
  getSummary() {
    return request("/api/incidents/summary");
  },
  listIncidents() {
    return request("/api/incidents");
  },
  createIncident(payload) {
    return request("/api/incidents", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateIncident(id, payload) {
    return request(`/api/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }
};
