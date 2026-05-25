import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getBooks } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Header() {
  const [booksCount, setBooksCount] = useState(0);
  const [theme, setTheme] = useState(
    localStorage.getItem("booksWebsiteTheme") || "dark"
  );
  const { totalCount } = useCart();
  const { user } = useAuth();

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

    return () => {
      ignore = true;
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
      <Link className="header-action header-action-left" to="/cart">
        Корзина ({totalCount})
      </Link>

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
        <Link className="header-action header-action-right" to="/personal">
          Личный кабинет: {user || "Гость"}
        </Link>
        <button className="theme-toggle" type="button" onClick={toggleTheme}>
          Тема: {theme === "dark" ? "тёмная" : "белая"}
        </button>
      </div>
    </header>
  );
}

export default Header;
