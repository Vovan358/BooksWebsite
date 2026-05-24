import request from "./client";

const API_URL = "https://localhost:7149/api";

export const getBooks = async () => {
  const res = await fetch(`${API_URL}/book`);
  return res.json();
};

export const getComments = async (bookId) => {
  const res = await fetch(`${API_URL}/comment/book/${bookId}`);
  return res.json();
};

export const addComment = (comment) =>
  request("/comment", {
    method: "POST",
    body: JSON.stringify(comment),
  });

export const placeOrder = (items) =>
  request("/book/order", {
    method: "POST",
    body: JSON.stringify(items),
  });


const BASE_URL = "https://localhost:7149/api";

export const loginRequest = async (username, password) => {
  const res = await fetch("https://localhost:7149/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const text = await res.text(); // 👈 ВСЕГДА читаем текст

  if (!res.ok) {
    throw new Error(text || "Invalid credentials");
  }

  return JSON.parse(text);
};

export async function registerRequest(username, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      passwordHash: password,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
}

