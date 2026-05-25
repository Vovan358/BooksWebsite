import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/books";

function BookGrid({ books }) {
  const { items, addToCart } = useCart();

  return (
    <div className="book-grid">
      {books.map((book) => {
        const inCart = items.find((item) => item.bookId === book.id)?.quantity || 0;
        const isDisabled = !book.available || inCart >= book.stock;

        return (
          <article className="book-card" key={book.id}>
            <Link to={`/books/${book.id}`} aria-label={book.title}>
              <img
                className="book-card-image"
                src={getImageUrl(book)}
                alt={book.title}
              />
            </Link>
            <div className="book-card-body">
              <div>
                <Link to={`/books/${book.id}`} className="book-card-title">
                  <h3>{book.title}</h3>
                </Link>
                <p className="muted">{book.author}</p>
                <div className="book-meta">
                  <span>В наличии: {book.stock}</span>
                  <span>Рейтинг: {(book.averageRating || 0).toFixed(1)}</span>
                  <span>Отзывы: {book.commentsNumber || 0}</span>
                </div>
              </div>
              <div className="button-row">
                <span className="price">{book.price} ₽</span>
                <button
                  className={isDisabled ? "btn btn-danger" : "btn btn-primary"}
                  onClick={() => addToCart(book)}
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
