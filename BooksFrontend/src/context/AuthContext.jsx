import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthOpen, setAuthOpen] = useState(false);

  const openAuth = () => setAuthOpen(true);
  const closeAuth = () => setAuthOpen(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      setAuthOpen(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (newToken, username) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", username);

    setToken(newToken);
    setUser(username);

    await fetch("https://localhost:7149/api/auth/cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(username),
    });

    await fetch("https://localhost:7149/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(username),
    });
  };

  const logout = async () => {
    try {
      await fetch("https://localhost:7149/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, openAuth, closeAuth, isAuthOpen }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
