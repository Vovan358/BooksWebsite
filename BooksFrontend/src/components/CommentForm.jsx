import { useState } from "react";
import { addComment } from "../api/api";
import { useAuth } from "../context/AuthContext";

function CommentForm({ book, onAdd }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const { user, openAuth } = useAuth();
  const [notify, setNotify] = useState(false); // чекбокс уведомлений

  const handleSubmit = (e) => {
    e.preventDefault();

    const newComment = {
      bookId: book.id,
      author: user,
      text,
      rating: Number(rating),
    };

    if (onAdd) onAdd(newComment); // просто передаём наверх
    setText("");
    setRating(5);
    setNotify(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px", marginTop: "20px" }}>

      <textarea
        placeholder="Комментарий"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <input
        type="number"
        min="0"
        max="10"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
        style={{ display: "block", marginBottom: "10px", width: "100px" }}
      />

      <label style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          style={{ marginRight: "8px" }} // расстояние между чекбоксом и текстом
        />
        Получать уведомления
      </label>

      {user ? (
      <button style={{background: "#ffa726",
        color: "#212121ff"
      }}type="submit">Оставить отзыв</button>
    ) : (
      <button
        type="button"
        onClick={openAuth}
        style={{
          background: "#43a047",
          color: "white",
          border: "none",
          padding: "10px",
          width: "25%",
          cursor: "pointer",
        }}
      >
        Войти, чтобы оставить отзыв
      </button>
    )}
    </form>
  );
}

export default CommentForm;