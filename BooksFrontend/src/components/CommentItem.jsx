import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import { formatRelativeDate } from "../utils/date";

function CommentItem({ comment, canDelete = false, onDelete, onReport, onVote }) {
  const { profile } = useProfile();
  const [expanded, setExpanded] = useState(false);
  const score = comment.score || 0;
  const scoreClass =
    score > 0 ? "comment-score-positive" : score < 0 ? "comment-score-negative" : "";
  const isOwnComment = Boolean(profile?.userId && comment.userId === profile.userId);
  const authorContent = comment.userId ? (
    <Link
      className="review-author-link"
      to={`/users/${comment.userId}`}
      state={{ username: comment.author }}
    >
      {comment.author}
    </Link>
  ) : (
    comment.author
  );

  return (
    <article
      className={`review-item ${isOwnComment ? "is-own-comment" : ""}`}
      id={`comment-${comment.id}`}
    >
      {canDelete && (
        <button
          className="comment-delete-button"
          type="button"
          onClick={() => onDelete?.(comment.id)}
          title="Удалить комментарий"
        >
          ×
        </button>
      )}
      <div className="review-header">
        <strong>
          {authorContent}
        </strong>
        {comment.createdAt &&
          <span className="muted"> • {formatRelativeDate(comment.createdAt)}</span>}
      </div>
      <div className={`comment-text-box ${expanded ? "is-expanded" : ""}`}>
        <p className="page-subtitle">{comment.text}</p>
        {(comment.text || "").length > 260 && (
          <button
            className="description-toggle"
            type="button"
            onClick={() => setExpanded((current) => !current)}
            style = {{marginBottom: -10}}
          >
            {expanded ? "Меньше" : "Больше"}
          </button>
        )}
      </div>
      <div className="review-actions">
        <span className="price">Оценка: {comment.rating}/10</span>
        <div className="comment-vote-control" aria-label="Рейтинг комментария">
          <button
            className={`comment-vote-button ${comment.myVote === 1 ? "is-active-up" : ""}`}
            type="button"
            onClick={() => onVote(comment.id, 1)}
            disabled={isOwnComment}
            aria-label="Лайкнуть комментарий"
            title={isOwnComment ? "Нельзя оценивать свой отзыв" : "Лайк"}
          >
            +
          </button>
          <span className={`comment-score ${scoreClass}`}>{score}</span>
          <button
            className={`comment-vote-button ${comment.myVote === -1 ? "is-active-down" : ""}`}
            type="button"
            onClick={() => onVote(comment.id, -1)}
            disabled={isOwnComment}
            aria-label="Дизлайкнуть комментарий"
            title={isOwnComment ? "Нельзя оценивать свой отзыв" : "Дизлайк"}
          >
            -
          </button>
        </div>
        <button
          className={`comment-report-button ${comment.isReportedByMe ? "is-reported" : ""}`}
          type="button"
          onClick={() => onReport(comment.id)}
          disabled={comment.isReportedByMe || isOwnComment}
          aria-label="Пожаловаться на комментарий"
          title={
            isOwnComment
              ? "Нельзя пожаловаться на свой отзыв"
              : comment.isReportedByMe
                ? "Жалоба отправлена"
                : "Пожаловаться"
          }
        >
          !
        </button>
      </div>
    </article>
  );
}

export default CommentItem;
