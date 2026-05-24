import { useState } from "react";
import { loginRequest, registerRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";

function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();

  const [mode, setMode] = useState("login"); // 🔥 режим
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  

  useEffect(() => {
    if (isOpen) {
        usernameRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setError("");
  }, [username, password]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const validate = () => {
    if (username.trim().length < 4) {
        setError("Никнейм должен быть минимум 4 символа");
        return false;
    }

    if (password.length < 6) {
        setError("Пароль должен быть минимум 6 символов");
        return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");

    // 1. клиентская проверка
    if (!validate()) return;

    try {
        let data;

        // 2. запросы
        if (mode === "login") {
        data = await loginRequest(username, password);
        } else {
        await registerRequest(username, password);
        data = await loginRequest(username, password);
        }

        login(data.token, data.username);
        onClose();
    } catch (err) {
        const msg = err.message.toLowerCase();

        if (msg.includes("username") || msg.includes("password")) {
            setError("Неверный логин или пароль");
        } else if (msg.includes("exists")) {
            setError("Пользователь уже существует");
        } else {
            setError("Ошибка входа. Попробуйте снова");
        }
        }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>
          {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
        </h2>

        <input
          type="text"
          ref={usernameRef}
          placeholder="Имя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Enter") passwordRef.current?.focus();
          }}
        />

        <input
          type="password"
          placeholder="Пароль"
          ref={passwordRef}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        {error && (
          <p style={{ color: "#ff6b6b", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <button onClick={handleSubmit} style={{ width: "100%",
            background: "#43a047", color: "white"
         }}>
          {mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>

        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
        </p>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          style={{ background: "transparent", color: "#90caf9" }}
        >
          {mode === "login"
            ? "Перейти к регистрации"
            : "Перейти к входу"}
        </button>

        <button onClick={handleClose} style={{ marginTop: "10px", 
            background: "#ff0800", color: "rgb(242, 242, 242)" }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#262431",
  padding: "30px",
  borderRadius: "10px",
  width: "300px",
  color: "white",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "10px",
  padding: "8px",
};

export default AuthModal;