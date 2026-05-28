import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const labels = {
  "": "Новинки",
  catalogue: "Каталог",
  leaderboard: "Покупатели",
  personal: "Личный кабинет",
  cart: "Корзина",
  checkout: "Оформление",
  books: "Книга",
  users: "Профиль",
  admin: "Админ-панель",
};

function Breadcrumbs() {
  const location = useLocation();
  const { user } = useAuth();
  const parts = location.pathname.split("/").filter(Boolean);

  if (location.pathname === "/") return null;

  if (parts[0] === "books" && parts[1]) {
    const from =
      typeof location.state?.from === "string" ? location.state.from : "/";
    const fromLabel = from.startsWith("/catalogue") ? labels.catalogue : labels[""];
    const bookTitle = location.state?.bookTitle || `Книга #${parts[1]}`;

    return (
      <nav className="breadcrumbs" aria-label="Навигационная цепочка">
        <Link to={from}>{fromLabel}</Link>
        <span className="breadcrumb-part">
          <span>/</span>
          <span>{bookTitle}</span>
        </span>
      </nav>
    );
  }

  if (parts[0] === "users" && parts[1]) {
    return (
      <nav className="breadcrumbs" aria-label="Навигационная цепочка">
        <Link to={user ? "/personal" : "/auth"}>Профиль</Link>
        <span className="breadcrumb-part">
          <span>/</span>
          <span>{location.state?.username || `Пользователь #${parts[1]}`}</span>
        </span>
      </nav>
    );
  }

  if (parts[0] === "admin") {
    const adminLabels = {
      users: "Пользователи",
      orders: "Заказы",
      comments: "Комментарии",
      books: "Книги",
    };

    return (
      <nav className="breadcrumbs" aria-label="Навигационная цепочка">
        <Link to="/admin">Админ-панель</Link>
        {parts[1] && (
          <span className="breadcrumb-part">
            <span>/</span>
            <span>{adminLabels[parts[1]] || parts[1]}</span>
          </span>
        )}
      </nav>
    );
  }

  if (parts.length === 1) return null;

  const crumbs = parts.map((part, index) => {
    const path = `/${parts.slice(0, index + 1).join("/")}`;
    const isLast = index === parts.length - 1;
    const label = labels[part] || part;

    return isLast ? (
      <span key={path}>{label}</span>
    ) : (
      <Link key={path} to={path}>
        {label}
      </Link>
    );
  });

  return (
    <nav className="breadcrumbs" aria-label="Навигационная цепочка">
      <Link to="/">Новинки</Link>
      {crumbs.map((crumb, index) => (
        <span className="breadcrumb-part" key={index}>
          <span>/</span>
          {crumb}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
