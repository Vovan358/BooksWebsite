import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../api/api";
import BookGrid from "../components/BookGrid";
import Pagination from "../components/Pagination";
import { filterBooks, paginate, PAGE_SIZE, sortBooks } from "../utils/books";

function CataloguePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
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
  }, [search, sortBy]);

  const visibleBooks = useMemo(() => {
    return sortBooks(filterBooks(books, search), sortBy);
  }, [books, search, sortBy]);

  const pageData = paginate(visibleBooks, page, PAGE_SIZE);

  return (
    <main className="page-shell">
      <div className="page-title-row">
        <div>
          <h1>Каталог</h1>
          <p className="page-subtitle">Поиск, сортировка и рейтинг книг.</p>
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
        <select
          className="select-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="cost">Цена</option>
          <option value="stock">Наличие</option>
          <option value="commentsNumber">Количество отзывов</option>
          <option value="averageRating">Средний рейтинг</option>
          <option value="author">Автор</option>
          <option value="name">Название</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Загрузка каталога...</div>
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

export default CataloguePage;
