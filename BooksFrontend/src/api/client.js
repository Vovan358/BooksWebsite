const BASE_URL = "https://localhost:7149/api";

// 🔥 универсальный fetch с JWT
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

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  }

  // 🔥 ВАЖНЫЙ ФИКС
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  // если пустой ответ
  return text ? JSON.parse(text) : null;
}
export default request;