import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

function CommentItem({ comment, onReport, onVote }) {
  const { profile } = useProfile();
  const score = comment.score || 0;
  const scoreClass =
    score > 0 ? "comment-score-positive" : score < 0 ? "comment-score-negative" : "";
  const isOwnComment = Boolean(profile?.userId && comment.userId === profile.userId);
  const authorContent = comment.userId ? (
    <Link className="review-author-link" to={`/users/${comment.userId}`}>
      {comment.author}
    </Link>
  ) : (
    comment.author
  );

  return (
    <article className="review-item">
      <div className="review-header">
        <strong>
          {authorContent}
        </strong>
        {comment.createdAt &&
          <span className="muted"> • {new Date(comment.createdAt).toLocaleDateString()}</span>}
      </div>
      <p className="page-subtitle">{comment.text}</p>
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
