import request from "./client";

const BASE_URL = "https://localhost:7149/api";

async function publicRequest(url, options = {}) {
  const response = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Request failed");
  }

  return text ? JSON.parse(text) : null;
}

function toQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

// Books
export const getBooks = () => request("/book");

export const getBook = (id) => request(`/book/${id}`);

// Comments
export const getComments = (bookId) => request(`/comment/book/${bookId}`);

export const addComment = (comment) =>
  request("/comment", {
    method: "POST",
    body: JSON.stringify(comment),
  });

// Auth
export const loginRequest = (username, password) =>
  publicRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const registerRequest = (username, password) =>
  publicRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      passwordHash: password,
    }),
  });

// Orders
export const createOrder = (items) =>
  request("/order", {
    method: "POST",
    body: JSON.stringify({ items }),
  });

export const getMyOrders = () => request("/order/my");

// Backward compatibility for the current Cart component.
export const placeOrder = createOrder;

// Leaderboard
export const getLeaderboard = (
  sortBy = "booksBought",
  page = 1,
  pageSize = 10
) => request(`/leaderboard${toQuery({ sortBy, page, pageSize })}`);

// User
export const getMyStats = () => request("/user/me/stats");
