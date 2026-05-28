import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getBooks } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProfile } from "../context/ProfileContext";

function Header() {
  const [booksCount, setBooksCount] = useState(0);
  const [theme, setTheme] = useState(
    localStorage.getItem("booksWebsiteTheme") || "dark"
  );
  const { totalCount } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useProfile();

  useEffect(() => {
    let ignore = false;

    const loadBooksCount = async () => {
      try {
        const books = await getBooks();
        if (!ignore) setBooksCount(books.length);
      } catch {
        if (!ignore) setBooksCount(0);
      }
    };

    loadBooksCount();
    window.addEventListener("books:changed", loadBooksCount);

    return () => {
      ignore = true;
      window.removeEventListener("books:changed", loadBooksCount);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("booksWebsiteTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <header className="site-header">
      <Link className="header-action header-action-left" data-cart-button to="/cart">
        Корзина ({totalCount})
      </Link>
      {isAdmin && (
        <Link className="header-action header-admin-link" to="/admin">
          Админ-панель
        </Link>
      )}

      <div className="header-center">
        <h1>BooksWebsite</h1>
        <h2>Маркетплейс с {booksCount} книгами</h2>

        <nav className="header-nav" aria-label="Основная навигация">
          <NavLink to="/">новинки</NavLink>
          <NavLink to="/catalogue">каталог</NavLink>
          <NavLink to="/leaderboard">покупатели</NavLink>
        </nav>
      </div>

      <div className="header-user">
        <Link className="header-action header-action-right" to={user ? "/personal" : "/auth"}>
          {user || "Войти в аккаунт"}
        </Link>
        <button
          className={`theme-toggle theme-switch ${theme === "light" ? "is-light" : ""}`}
          type="button"
          onClick={toggleTheme}
          aria-label="Переключить тему"
          title={theme === "dark" ? "Тёмная тема" : "Светлая тема"}
        >
          <span />
        </button>
      </div>
    </header>
  );
}

export default Header;
