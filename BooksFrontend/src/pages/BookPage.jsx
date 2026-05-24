import { useParams } from "react-router-dom";

function BookPage() {
  const { id } = useParams();

  return (
    <main style={{ padding: "20px" }}>
      <h1>Книга #{id}</h1>
      <p>Страница книги будет наполнена на следующем этапе.</p>
    </main>
  );
}

export default BookPage;
