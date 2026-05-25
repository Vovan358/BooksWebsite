function CommentItem({ comment }) {
  return (
    <article className="review-item">
      <strong>
        {comment.author}
        {comment.createdAt &&
          ` • ${new Date(comment.createdAt).toLocaleDateString()}`}
      </strong>
      <p className="page-subtitle">{comment.text}</p>
      <span className="price">Оценка: {comment.rating}/10</span>
    </article>
  );
}

export default CommentItem;
