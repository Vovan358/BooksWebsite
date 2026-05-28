import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBook, getBooks } from "../api/api";
import BookGrid from "../components/BookGrid";
import CommentsSection from "../components/CommentsSection";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useProfile } from "../context/ProfileContext";
import { useToast } from "../context/ToastContext";
import { getBookBadge, getImageUrl, getRatingClass } from "../utils/books";
import { pluralRu } from "../utils/plural";
import { addRecentlyViewed, removeRecentlyViewed } from "../utils/recentlyViewed";

function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { items, addToCart, removeFromCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAdmin } = useProfile();
  const { showToast } = useToast();

  const loadBook = async () => {
    try {
      const [data, allBooks] = await Promise.all([getBook(id), getBooks()]);
      setBook(data);
      setBooks(allBooks);
      addRecentlyViewed(data);
    } catch {
      setBook(null);
      setBooks([]);
      removeRecentlyViewed(id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadBook();
  }, [id]);

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
        <div className="empty-state">
          <p>Упс, кажется, такой книги не существует!</p>
          <p>
            <Link to="/">Найти существующую книгу</Link>
          </p>
        </div>
      </main>
    );
  }

  const inCart = items.find((item) => item.bookId === book.id)?.quantity || 0;
  const isStopped = Boolean(book.isHidden);
  const isDisabled = isStopped || !book.available || book.stock < 1;
  const rating = book.averageRating || 0;
  const badge = getBookBadge(book, books);
  const favorite = isFavorite(book.id);
  const hasComments = (book.commentsNumber || 0) > 0;
  const soldCount = book.soldCount || 0;
  const favoritesCount = book.favoritesCount || 0;
  const recommendations = books
    .filter((candidate) => candidate.id !== book.id)
    .sort((a, b) => ((a.id * 17) % 101) - ((b.id * 17) % 101))
    .slice(0, 2);
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
          <div className="book-title-line">
            <h1>{book.title}</h1>
            {isAdmin && (
              <button
                className="btn btn-ghost"
                onClick={() =>
                  navigate("/admin/books", {
                    state: { editBookId: book.id },
                  })
                }
              >
                Изменить
              </button>
            )}
          </div>
          <p className="page-subtitle">Автор: {book.author}</p>
          <div className="book-price-row">
            <span className={`book-price-badge ${isStopped ? "is-stopped" : ""}`}>
              {isStopped ? "Продажи прекращены" : `${book.price} ₽`}
            </span>
            <span className="book-inline-stats">
              <span >
                {soldCount === 0
                  ? "не заказывали"
                  : `${soldCount} ${pluralRu(soldCount, "заказ", "заказа", "заказов")}`}
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
              <span className={`stat-value rating-value ${hasComments ? getRatingClass(rating) : "empty-stat neutral-empty-stat"}`}>
                {hasComments ? rating.toFixed(1) : "—"}
              </span>
              <span className="stat-label">Оценка</span>
            </div>
            <div className="stat-tile">
              <span className={`stat-value ${hasComments ? "" : "empty-stat neutral-empty-stat"}`}>
                {hasComments ? book.commentsNumber : "нет отзывов"}
              </span>
              <span className="stat-label">Отзывов</span>
            </div>
          </div>

          <section className={`book-description-box ${descriptionExpanded ? "is-expanded" : ""}`}>
            <h2>Описание</h2>
            <p>{book.description || "Описание пока не добавлено."}</p>
            {(book.description || "").length > 260 && (
              <button
                className="description-toggle"
                type="button"
                onClick={() => setDescriptionExpanded((current) => !current)}
              >
                {descriptionExpanded ? "Меньше" : "Больше"}
              </button>
            )}
          </section>

          <div className="book-action-panel">
            <button
              className={isDisabled ? "btn btn-danger book-add-main" : "btn btn-primary book-add-main"}
              disabled={isDisabled}
              onClick={handleAddToCart}
            >
              {isDisabled
                ? isStopped
                  ? "Продажи прекращены"
                  : "Нет в наличии"
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

      {recommendations.length > 0 && (
        <section className="recommendation-section">
          <div className="page-title-row">
            <div>
              <h1>Вам может понравиться...</h1>
              <p className="page-subtitle">Пара похожих книг для вас.</p>
            </div>
          </div>
          <BookGrid books={recommendations} leaderSource={books} />
        </section>
      )}
    </main>
  );
}

export default BookPage;
