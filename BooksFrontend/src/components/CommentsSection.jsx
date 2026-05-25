import { useEffect, useState } from "react";
import { addComment, getComments } from "../api/api";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

function CommentsSection({ book, onChanged }) {
  const [comments, setComments] = useState([]);

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
    onChanged?.();
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
          <h1>Отзывы</h1>
          <p className="page-subtitle">
            {comments.length} отзывов, средний балл {averageRating.toFixed(1)}/10
          </p>
        </div>
      </div>

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
