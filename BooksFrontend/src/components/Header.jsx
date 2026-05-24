import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getBooks } from "../api/api";
import { useCart } from "../context/CartContext";

function Header() {
  const [booksCount, setBooksCount] = useState(0);
  const { totalCount } = useCart();

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

      <Link className="header-action header-action-right" to="/personal">
        Личный кабинет
      </Link>
    </header>
  );
}

export default Header;
