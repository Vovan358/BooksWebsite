import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../api/api";
import BookGrid from "../components/BookGrid";
import PageSkeleton from "../components/PageSkeleton";
import Pagination from "../components/Pagination";
import { useFavorites } from "../context/FavoritesContext";
import { filterBooks, paginate, PAGE_SIZE, sortBooks } from "../utils/books";
import { getRecentlyViewed } from "../utils/recentlyViewed";

function MainPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState(getRecentlyViewed);
  const { revision: favoritesRevision } = useFavorites();

  useEffect(() => {
    const load = async () => {
      const data = await getBooks();
      setBooks(data);
      setLoading(false);
    };

    load();
  }, [favoritesRevision]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const updateRecent = () => setRecentlyViewed(getRecentlyViewed());
    window.addEventListener("recently-viewed:changed", updateRecent);
    window.addEventListener("storage", updateRecent);
    return () => {
      window.removeEventListener("recently-viewed:changed", updateRecent);
      window.removeEventListener("storage", updateRecent);
    };
  }, []);

  const filtered = useMemo(
    () => sortBooks(filterBooks(books, search), "createdAt", "desc"),
    [books, search]
  );
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
        <PageSkeleton />
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

      {recentlyViewed.length > 0 && (
        <section className="recent-section">
          <div className="page-title-row">
            <div>
              <h1>Недавно просмотрено</h1>
              <p className="page-subtitle">Последние книги, в которые вы заходили.</p>
            </div>
          </div>
          <BookGrid books={recentlyViewed.slice(0, 10)} leaderSource={books} />
        </section>
      )}
    </main>
  );
}

export default MainPage;
