import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getBookBadge, getImageUrl, getRatingClass } from "../utils/books";

function BookGrid({ books, leaderSource = books }) {
  const { items, addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const openBook = (book) => {
    navigate(`/books/${book.id}`, {
      state: {
        from: location.pathname === "/catalogue" ? "/catalogue" : "/",
      },
    });
  };

  return (
    <div className="book-grid">
      {books.map((book) => {
        const inCart = items.find((item) => item.bookId === book.id)?.quantity || 0;
        const isDisabled = !book.available || inCart >= book.stock;
        const rating = book.averageRating || 0;
        const badge = getBookBadge(book, leaderSource);

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
                    addToCart(book);
                  }}
                  disabled={isDisabled}
                >
                  {isDisabled ? "Нет в наличии" : "В корзину"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default BookGrid;
