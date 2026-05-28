import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function AuthForm({ variant = "modal", onSuccess, onCancel }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    setError("");
  }, [username, password, mode]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      let data;

      if (mode === "login") {
        data = await loginRequest(username, password);
      } else {
        await registerRequest(username, password);
        data = await loginRequest(username, password);
        showToast("Поздравляем с созданием аккаунта!");
      }

      await login(data.token, data.username);
      onSuccess?.();

      if (variant === "page") {
        navigate(location.state?.from || "/", { replace: true });
      }
    } catch (err) {
      const message = err.message.toLowerCase();

      if (message.includes("exists")) {
        setError("Пользователь уже существует");
      } else if (message.includes("username") || message.includes("password")) {
        setError("Неверный логин или пароль");
      } else {
        setError("Ошибка входа. Попробуйте снова");
      }
    }
  };

  return (
    <form className={`auth-form auth-form-${variant}`} onSubmit={handleSubmit}>
      <div>
        <h1>{mode === "login" ? "Вход в аккаунт" : "Регистрация"}</h1>
        <p className="page-subtitle">
          {mode === "login"
            ? "Войдите, чтобы оформлять заказы и оставлять отзывы."
            : "Создайте аккаунт для покупок и отзывов."}
        </p>
      </div>

      <input
        className="form-input"
        ref={usernameRef}
        type="text"
        placeholder="Никнейм"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "ArrowDown") {
            event.preventDefault();
            passwordRef.current?.focus();
          }
        }}
      />

      <label className="password-field">
        <input
          className="form-input"
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && password.length === 0) {
              event.preventDefault();
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              usernameRef.current?.focus();
            }
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          title={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? "◉" : "○"}
        </button>
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button className="btn btn-success" type="submit">
        {mode === "login" ? "Войти" : "Зарегистрироваться"}
      </button>

      <button
        className="btn btn-ghost"
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Перейти к регистрации" : "Перейти ко входу"}
      </button>

      {onCancel && (
        <button className="btn btn-danger" type="button" onClick={onCancel}>
          Закрыть
        </button>
      )}
    </form>
  );
}

export default AuthForm;
