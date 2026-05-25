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
  const [sortDirection, setSortDirection] = useState("asc");
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
  }, [search, sortBy, sortDirection]);

  const visibleBooks = useMemo(() => {
    return sortBooks(filterBooks(books, search), sortBy, sortDirection);
  }, [books, search, sortBy, sortDirection]);

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
        <div className="sort-control">
          <button
            className={`sort-direction-button ${sortDirection === "desc" ? "is-desc" : ""}`}
            type="button"
            aria-label={
              sortDirection === "asc"
                ? "Сортировка по возрастанию"
                : "Сортировка по убыванию"
            }
            title={
              sortDirection === "asc"
                ? "Сортировка по возрастанию"
                : "Сортировка по убыванию"
            }
            onClick={() =>
              setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
            }
          >
            ▲
          </button>
          <select
            className="select-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="cost">Цена</option>
            <option value="stock">Наличие</option>
            <option value="soldCount">Количество заказов</option>
            <option value="commentsNumber">Количество отзывов</option>
            <option value="averageRating">Средний рейтинг</option>
            <option value="author">Автор</option>
            <option value="name">Название</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Загрузка каталога...</div>
      ) : pageData.items.length === 0 ? (
        <div className="empty-state">Книги не найдены.</div>
      ) : (
        <>
          <BookGrid books={pageData.items} leaderSource={books} />
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
