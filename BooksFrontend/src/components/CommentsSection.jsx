import { useEffect, useMemo, useState } from "react";
import { addComment, getComments } from "../api/api";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

function CommentsSection({ book, onChanged }) {
  const [comments, setComments] = useState([]);
  const [notice, setNotice] = useState("");
  const [sortBy, setSortBy] = useState("newFirst");

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

  const sortedComments = useMemo(() => {
    const sorted = [...comments];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case "angryFirst":
          return a.rating - b.rating;
        case "praiseFirst":
          return b.rating - a.rating;
        case "oldFirst":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "shortFirst":
          return (a.text || "").length - (b.text || "").length;
        case "longFirst":
          return (b.text || "").length - (a.text || "").length;
        case "newFirst":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return sorted;
  }, [comments, sortBy]);

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
        <>
          <div className="review-toolbar">
            <select
              className="select-input"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newFirst">Сначала новые</option>
              <option value="oldFirst">Сначала старые</option>
              <option value="angryFirst">Сначала хвалебные</option>
              <option value="praiseFirst">Сначала гневные</option>
              <option value="shortFirst">Сначала длинные</option>
              <option value="longFirst">Сначала короткие</option>
            </select>
          </div>
          <div className="review-list">
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default CommentsSection;
