import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBook, getBooks } from "../api/api";
import CommentsSection from "../components/CommentsSection";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { getBookBadge, getImageUrl, getRatingClass } from "../utils/books";
import { addRecentlyViewed } from "../utils/recentlyViewed";

function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items, addToCart, removeFromCart } = useCart();
  const { isFavorite, revision: favoritesRevision, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const loadBook = async () => {
    const [data, allBooks] = await Promise.all([getBook(id), getBooks()]);
    setBook(data);
    setBooks(allBooks);
    addRecentlyViewed(data);
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
  const isDisabled = !book.available || book.stock < 1;
  const rating = book.averageRating || 0;
  const badge = getBookBadge(book, books);
  const favorite = isFavorite(book.id);
  const hasComments = (book.commentsNumber || 0) > 0;
  const soldCount = book.soldCount || 0;
  const favoritesCount = book.favoritesCount || 0;
  const handleAddToCart = () => {
    if (inCart >= book.stock) {
      showToast("В корзине уже максимальное количество.", "error");
      return;
    }
    addToCart(book);
    showToast("Товар добавлен в корзину!");
  };

  const handleBuyNow = () => {
    if (inCart < book.stock) {
      addToCart(book);
    }
    navigate("/checkout");
  };

  const handleShare = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    showToast("Ссылка скопирована!");
  };

  return (
    <main className="page-shell">
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
          <div className="book-price-row">
            <span className="book-price-badge">{book.price} ₽</span>
            <span className="book-inline-stats">
              <span >
                {soldCount === 0 ? "не заказывали" : `${soldCount} заказов`}
              </span>
              <span>|</span>
              <span>{favoritesCount} ♥</span>
            </span>
            
          </div>

          <div className="stat-grid">
            <div className="stat-tile">
              <span className={`stat-value stock-value ${book.stock === 0 ? "stock-empty" : "stock-available"}`}>
                {book.stock === 0 ? "нет в наличии" : book.stock}
              </span>
              <span className="stat-label">В наличии</span>
            </div>
            <div className="stat-tile">
              <span className={`stat-value rating-value ${hasComments ? getRatingClass(rating) : "empty-stat"}`}>
                {hasComments ? rating.toFixed(1) : "—"}
              </span>
              <span className="stat-label">Оценка</span>
            </div>
            <div className="stat-tile">
              <span className={`stat-value ${hasComments ? "" : "empty-stat"}`}>
                {hasComments ? book.commentsNumber : "нет отзывов"}
              </span>
              <span className="stat-label">Отзывов</span>
            </div>
          </div>

          <p className="page-subtitle">
            {book.description || "Описание пока не добавлено."}
          </p>

          <div className="book-action-panel">
            <button
              className={isDisabled ? "btn btn-danger book-add-main" : "btn btn-primary book-add-main"}
              disabled={isDisabled}
              onClick={handleAddToCart}
            >
              {isDisabled
                ? "Нет в наличии"
                : inCart > 0
                  ? `Уже в корзине: ${inCart}`
                  : "Добавить в корзину"}
            </button>
            {inCart > 0 && (
              <button
                className="cart-remove-mini"
                type="button"
                onClick={() => removeFromCart(book.id)}
                title="Убрать из корзины"
              >
                ×
              </button>
            )}
            <button
              className={isDisabled ? "btn btn-danger book-buy-now" : "btn btn-success book-buy-now"}
              disabled={isDisabled}
              onClick={handleBuyNow}
            >
              Купить сейчас
            </button>
            <button className="btn book-share-button" onClick={handleShare}>
              Поделиться книгой
            </button>
          </div>
        </div>
      </section>

      <CommentsSection book={book} onChanged={loadBook} />
    </main>
  );
}

export default BookPage;
