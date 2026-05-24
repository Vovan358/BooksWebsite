import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { useEffect, useState } from "react";
import { getComments, addComment } from "../api/api";

function CommentsSection({ book }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getComments(book.id);
      setComments(data);
    };
    load();
  }, [book]);

  const handleAdd = async (newComment) => {
    const saved = await addComment(newComment); // ✅ ОДИН POST

    setComments(prev => [...prev, saved]); // сразу добавили
  };

  const averageRating =
    comments.length === 0
      ? 0
      : (
          comments.reduce((sum, c) => sum + c.rating, 0) /
          comments.length
        ).toFixed(1);

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Отзывы на: {book.title}</h2>
      <h3>({comments.length} отзывов)</h3>
      <h3>Средний балл: {averageRating}/10</h3>

      <CommentForm book={book} onAdd={handleAdd} />

      {comments.length === 0 ? (
        <p style={{ color: "#c9cfda" }}>Пока нет отзывов</p>
      ) : (
        comments.map(c => <CommentItem key={c.id} comment={c} />)
      )}
    </div>
  );
}

export default CommentsSection;