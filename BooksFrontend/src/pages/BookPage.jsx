import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getBook, getBooks } from "../api/api";
import CommentsSection from "../components/CommentsSection";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { getBookBadge, getImageUrl, getRatingClass } from "../utils/books";

function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items, addToCart } = useCart();
  const { isFavorite, revision: favoritesRevision, toggleFavorite } = useFavorites();

  const backTarget =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/catalogue")
      ? location.state.from
      : "/";

  const loadBook = async () => {
    const [data, allBooks] = await Promise.all([getBook(id), getBooks()]);
    setBook(data);
    setBooks(allBooks);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadBook();
  }, [favoritesRevision, id]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="empty-state">Загрузка книги...</div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="page-shell">
        <div className="empty-state">Книга не найдена.</div>
      </main>
    );
  }

  const inCart = items.find((item) => item.bookId === book.id)?.quantity || 0;
  const isDisabled = !book.available || inCart >= book.stock;
  const rating = book.averageRating || 0;
  const badge = getBookBadge(book, books);
  const favorite = isFavorite(book.id);

  return (
    <main className="page-shell">
      <button className="btn btn-ghost back-button" onClick={() => navigate(backTarget)}>
        ← назад
      </button>

      <section className="book-detail">
        <div className="book-detail-media">
          <img className="book-detail-cover" src={getImageUrl(book)} alt={book.title} />
          {badge && <span className="book-badge book-detail-badge">{badge}</span>}
          <button
            className={`favorite-button book-detail-favorite ${favorite ? "is-favorite" : ""}`}
            type="button"
            aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
            title={favorite ? "Убрать из избранного" : "Добавить в избранное"}
            onClick={() => toggleFavorite(book)}
          >
            ♥
          </button>
        </div>

        <div className="book-detail-info panel">
          <h1>{book.title}</h1>
          <p className="page-subtitle">Автор: {book.author}</p>

          <div className="stat-grid">
            <div className="stat-tile">
              <span className={`stat-value stock-value ${book.stock === 0 ? "stock-empty" : "stock-available"}`}>
                {book.stock}
              </span>
              <span className="stat-label">В наличии</span>
            </div>
            <div className="stat-tile">
              <span className={`stat-value rating-value ${getRatingClass(rating)}`}>
                {rating.toFixed(1)}
              </span>
              <span className="stat-label">Оценка</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{book.commentsNumber || 0}</span>
              <span className="stat-label">Отзывов</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{book.soldCount || 0}</span>
              <span className="stat-label">Заказов</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{book.favoritesCount || 0}</span>
              <span className="stat-label">Избранное</span>
            </div>
          </div>

          <p className="page-subtitle">
            {book.description || "Описание пока не добавлено."}
          </p>

          <div className="button-row" style={{ marginTop: "18px" }}>
            <span className="price">{book.price} ₽</span>
            <button
              className={isDisabled ? "btn btn-danger" : "btn btn-primary"}
              disabled={isDisabled}
              onClick={() => addToCart(book)}
            >
              {isDisabled ? "Нет в наличии" : "Добавить в корзину"}
            </button>
          </div>
        </div>
      </section>

      <CommentsSection book={book} onChanged={loadBook} />
    </main>
  );
}

export default BookPage;
