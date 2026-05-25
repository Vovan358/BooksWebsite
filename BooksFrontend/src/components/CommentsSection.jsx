import { useEffect, useState } from "react";
import { addComment, getComments } from "../api/api";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

function CommentsSection({ book, onChanged }) {
  const [comments, setComments] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getComments(book.id);
      setComments(data);
    };

    load();
  }, [book.id]);

  const handleAdd = async (newComment) => {
    const saved = await addComment(newComment);
    setComments((prev) => [...prev, saved]);
    setNotice("Отзыв оставлен!");
    onChanged?.();

    setTimeout(() => {
      setNotice("");
    }, 1800);
  };

  const averageRating =
    comments.length === 0
      ? 0
      : comments.reduce((sum, comment) => sum + comment.rating, 0) /
        comments.length;

  return (
    <section className="review-section">
      <div className="page-title-row">
        <div>
          <h1>Отзывы ({comments.length})</h1>
          <p className="page-subtitle">
            Средняя оценка: {averageRating.toFixed(1)}/10
          </p>
        </div>
      </div>

      {notice && <div className="notice review-notice">{notice}</div>}

      <CommentForm book={book} onAdd={handleAdd} />

      {comments.length === 0 ? (
        <div className="empty-state">Пока нет отзывов.</div>
      ) : (
        <div className="review-list">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CommentsSection;
