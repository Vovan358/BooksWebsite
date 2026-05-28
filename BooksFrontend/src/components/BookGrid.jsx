import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { getBookBadge, getImageUrl, getRatingClass } from "../utils/books";

function BookGrid({ books, leaderSource = books }) {
  const { items, addToCart, removeFromCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const openBook = (book) => {
    const returnTarget = `${location.pathname}${location.search}`;

    navigate(`/books/${book.id}`, {
      state: {
        from: location.pathname === "/catalogue" ? returnTarget : "/",
        bookTitle: book.title,
      },
    });
  };

  const animateToCart = (event, book) => {
    const cartButton = document.querySelector("[data-cart-button]");
    const card = event.currentTarget.closest(".book-card");
    const image = card?.querySelector(".book-card-image");
    if (!cartButton || !image) return;

    const from = image.getBoundingClientRect();
    const to = cartButton.getBoundingClientRect();
    const flyer = document.createElement("img");
    flyer.src = getImageUrl(book);
    flyer.className = "cart-flyer";
    flyer.style.left = `${from.left}px`;
    flyer.style.top = `${from.top}px`;
    flyer.style.width = `${from.width}px`;
    flyer.style.height = `${from.height}px`;
    document.body.appendChild(flyer);

    requestAnimationFrame(() => {
      flyer.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.16)`;
      flyer.style.opacity = "0.15";
    });

    setTimeout(() => flyer.remove(), 520);
  };

  return (
    <div className="book-grid">
      {books.map((book) => {
        const inCart = items.find((item) => item.bookId === book.id)?.quantity || 0;
        const isDisabled = !book.available || book.stock < 1;
        const rating = book.averageRating || 0;
        const badge = getBookBadge(book, leaderSource);
        const favorite = isFavorite(book.id);

        return (
          <article
            className={badge ? "book-card book-card-featured" : "book-card"}
            key={book.id}
            role="link"
            tabIndex={0}
            onClick={() => openBook(book)}
            onKeyDown={(event) => {
              if (event.key === "Enter") openBook(book);
            }}
          >
            <img
              className="book-card-image"
              src={getImageUrl(book)}
              alt={book.title}
            />
            {badge && <span className="book-badge">{badge}</span>}
            <button
              className={`favorite-button book-card-favorite ${favorite ? "is-favorite" : ""}`}
              type="button"
              aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
              title={favorite ? "Убрать из избранного" : "Добавить в избранное"}
              onClick={(event) => {
                event.stopPropagation();
                toggleFavorite(book);
              }}
            >
              ♥
            </button>
            <div className="book-card-body">
              <div>
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
                <div className="book-meta">
                  <span>
                    <strong className={`rating-value ${getRatingClass(rating)}`}>
                      {rating.toFixed(1)}
                    </strong>{" "}
                    ({book.commentsNumber || 0} оценок)
                  </span>
                </div>
              </div>
              <div className="button-row">
                <span className="price">{book.price} ₽</span>
                <button
                  className={isDisabled ? "btn btn-danger" : "btn btn-primary"}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (inCart >= book.stock) {
                      showToast("В корзине уже максимальное количество.", "error");
                      return;
                    }
                    animateToCart(event, book);
                    addToCart(book);
                    showToast("Товар добавлен в корзину!");
                  }}
                  disabled={isDisabled}
                >
                  {isDisabled
                    ? "Нет в наличии"
                    : inCart > 0
                      ? `Уже в корзине: ${inCart}`
                      : "В корзину"}
                </button>
                {inCart > 0 && (
                  <button
                    className="cart-remove-mini"
                    type="button"
                    aria-label="Убрать книгу из корзины"
                    title="Убрать из корзины"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFromCart(book.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default BookGrid;
