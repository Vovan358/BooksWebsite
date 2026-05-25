const BASE_URL = "https://localhost:7149/api";

async function request(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(BASE_URL + url, {
    ...options,
    headers,
  });

  const text = await response.text();

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  if (!response.ok) {
    throw new Error(text || "Request failed");
  }

  return text ? JSON.parse(text) : null;
}

export default request;
