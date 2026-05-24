function CommentItem({ comment }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px"
      }}
    >
      <strong>
        👤 {comment.author}
        {comment.createdAt && ` • ${new Date(comment.createdAt).toLocaleDateString()}`}
      </strong>
      
      <p style= {{color: "#c9cfda"}}>{comment.text}</p>
      <p style= {{color: "#c9cfda"}}>Оценка: {comment.rating}/10</p>
    </div>
  );
}

export default CommentItem;