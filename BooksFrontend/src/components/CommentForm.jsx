import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function CommentForm({ book, onAdd }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const { user, openAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onAdd({
      bookId: book.id,
      text,
      rating: Number(rating),
    });

    setText("");
    setRating(5);
  };

  if (!user) {
    return (
      <div className="panel">
        <p className="page-subtitle">Войдите, чтобы оставить отзыв.</p>
        <button className="btn btn-success" type="button" onClick={openAuth}>
          Войти
        </button>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <textarea
        className="form-textarea"
        placeholder="Ваш отзыв"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={4}
      />
      <input
        className="form-input"
        type="number"
        min="0"
        max="10"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
      />
      <button className="btn btn-primary" type="submit">
        Оставить отзыв
      </button>
    </form>
  );
}

export default CommentForm;
