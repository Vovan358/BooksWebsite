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

export const voteComment = (commentId, value) =>
  request(`/comment/${commentId}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });

export const reportComment = (commentId) =>
  request(`/comment/${commentId}/report`, {
    method: "POST",
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
export const createOrder = (items, orderInfo = {}) =>
  request("/order", {
    method: "POST",
    body: JSON.stringify({ items, ...orderInfo }),
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

export const getMyProfile = () => request("/user/me/profile");

export const updateMyProfile = (profile) =>
  request("/user/me/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });

export const getPublicUserProfile = (id) => request(`/user/${id}/profile`);

// Favorites
export const getFavorites = () => request("/favorite");

export const addFavorite = (bookId) =>
  request("/favorite", {
    method: "POST",
    body: JSON.stringify({ bookId }),
  });

export const removeFavorite = (bookId) =>
  request(`/favorite/${bookId}`, {
    method: "DELETE",
  });

// Admin
export const getAdminDashboard = () => request("/admin/dashboard");

export const getAdminUsers = ({
  search = "",
  sortBy = "createdAt",
  direction = "desc",
  page = 1,
  pageSize = 10,
} = {}) =>
  request(
    `/admin/users${toQuery({ search, sortBy, direction, page, pageSize })}`
  );

export const getAdminOrders = ({
  search = "",
  sortBy = "date",
  direction = "desc",
  page = 1,
  pageSize = 10,
} = {}) =>
  request(
    `/admin/orders${toQuery({ search, sortBy, direction, page, pageSize })}`
  );

export const getAdminComments = ({
  search = "",
  onlyReported = false,
  page = 1,
  pageSize = 10,
} = {}) =>
  request(
    `/admin/comments${toQuery({ search, onlyReported, page, pageSize })}`
  );

export const deleteAdminComment = (id) =>
  request(`/admin/comments/${id}`, {
    method: "DELETE",
  });

export const getAdminBooks = ({ search = "", page = 1, pageSize = 10 } = {}) =>
  request(`/admin/books${toQuery({ search, page, pageSize })}`);

export const createAdminBook = (book) =>
  request("/admin/books", {
    method: "POST",
    body: JSON.stringify(book),
  });

export const updateAdminBook = (id, book) =>
  request(`/admin/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book),
  });

export const deleteAdminBook = (id) =>
  request(`/admin/books/${id}`, {
    method: "DELETE",
  });

export const clearAdminBookComments = (id) =>
  request(`/admin/books/${id}/comments`, {
    method: "DELETE",
  });
