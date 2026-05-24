import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const openAuth = () => setAuthOpen(true);
  const closeAuth = () => setAuthOpen(false);
  

  // 🔄 При загрузке восстанавливаем сессию
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");
    const lastLogin = localStorage.getItem("lastLogin"); //15
    console.log("Last login:", lastLogin); //15

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  // 🔐 LOGIN
  const login = async (token, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);

    setToken(token);
    setUser(username);

    // 🔥 ДОБАВЛЯЕМ СИНХРОНИЗАЦИЮ С SESSION + COOKIE
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

  // 📝 REGISTER (по сути тот же login после регистрации)
  const register = (token, username) => {
    login(token, username);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await fetch("https://localhost:7149/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, openAuth, closeAuth, isAuthOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

// удобный хук
export function useAuth() {
  return useContext(AuthContext);
}