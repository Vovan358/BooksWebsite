import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBook } from "../api/api";
import CommentsSection from "../components/CommentsSection";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/books";

function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { items, addToCart } = useCart();

  const loadBook = async () => {
    const data = await getBook(id);
    setBook(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  if (loading) {
    return <main className="page-shell"><div className="empty-state">Загрузка книги...</div></main>;
  }

  if (!book) {
    return <main className="page-shell"><div className="empty-state">Книга не найдена.</div></main>;
  }

  const inCart = items.find((item) => item.bookId === book.id)?.quantity || 0;
  const isDisabled = !book.available || inCart >= book.stock;

  return (
    <main className="page-shell">
      <section className="book-detail">
        <img className="book-detail-cover" src={getImageUrl(book)} alt={book.title} />

        <div className="book-detail-info panel">
          <h1>{book.title}</h1>
          <p className="page-subtitle">by {book.author}</p>

          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-value">{book.stock}</span>
              <span className="stat-label">stock</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{(book.averageRating || 0).toFixed(1)}</span>
              <span className="stat-label">rating</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{book.commentsNumber || 0}</span>
              <span className="stat-label">reviews</span>
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
