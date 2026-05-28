import { useEffect, useMemo, useState } from "react";
import { addComment, getComments, reportComment, voteComment } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

function CommentsSection({ book, onChanged }) {
  const { user, openAuth } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
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
    showToast("Отзыв оставлен!");
    onChanged?.();
  };

  const replaceComment = (updatedComment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleVote = async (commentId, value) => {
    if (!user) {
      openAuth();
      return;
    }

    const updated = await voteComment(commentId, value);
    replaceComment(updated);
  };

  const handleReport = async (commentId) => {
    if (!user) {
      openAuth();
      return;
    }

    const updated = await reportComment(commentId);
    replaceComment(updated);
    showToast("Жалоба отправлена.");
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
        case "popularFirst":
          return (b.score || 0) - (a.score || 0);
        case "unpopularFirst":
          return (a.score || 0) - (b.score || 0);
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
              <option value="angryFirst">Сначала гневные</option>
              <option value="praiseFirst">Сначала хвалебные</option>
              <option value="popularFirst">Сначала популярные</option>
              <option value="unpopularFirst">Сначала непопулярные</option>
              <option value="shortFirst">Сначала короткие</option>
              <option value="longFirst">Сначала длинные</option>
            </select>
          </div>
          <div className="review-list">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReport={handleReport}
                onVote={handleVote}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default CommentsSection;
