import request from "./client";

// BOOKS
export const getBooks = () => request("/book");

// COMMENTS
export const getComments = (bookId) =>
  request(`/comment/book/${bookId}`);

export const addComment = (comment) =>
  request("/comment", {
    method: "POST",
    body: JSON.stringify(comment),
  });

// AUTH (без токена)
export const loginRequest = async (username, password) => {
  const res = await fetch("https://localhost:7149/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const registerRequest = async (username, password) => {
  const res = await fetch("https://localhost:7149/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ORDER
export const placeOrder = (items) =>
  request("/book/order", {
    method: "POST",
    body: JSON.stringify(items),
  });