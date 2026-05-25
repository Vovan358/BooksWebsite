import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../api/api";
import BookGrid from "../components/BookGrid";
import Pagination from "../components/Pagination";
import { filterBooks, paginate, PAGE_SIZE } from "../utils/books";

function MainPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      const data = await getBooks();
      setBooks(data);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => filterBooks(books, search), [books, search]);
  const pageData = paginate(filtered, page, PAGE_SIZE);

  return (
    <main className="page-shell">
      <div className="page-title-row">
        <div>
          <h1>Книги-новинки</h1>
          <p className="page-subtitle">Свежая подборка книг из каталога.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Поиск по названию или автору"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted">Найдено: {filtered.length}</span>
      </div>

      {loading ? (
        <div className="empty-state">Загрузка книг...</div>
      ) : pageData.items.length === 0 ? (
        <div className="empty-state">Книги не найдены.</div>
      ) : (
        <>
          <BookGrid books={pageData.items} />
          <Pagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </main>
  );
}

export default MainPage;
