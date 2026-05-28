import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../api/api";
import BookGrid from "../components/BookGrid";
import PageSkeleton from "../components/PageSkeleton";
import { useFavorites } from "../context/FavoritesContext";
import { sortBooks } from "../utils/books";
import { getRecentlyViewed, syncRecentlyViewed } from "../utils/recentlyViewed";

function MainPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState(getRecentlyViewed);
  const { revision: favoritesRevision } = useFavorites();

  useEffect(() => {
    const load = async () => {
      const data = await getBooks();
      setBooks(data);
      setRecentlyViewed(syncRecentlyViewed(data));
      setLoading(false);
    };

    load();
  }, [favoritesRevision]);

  useEffect(() => {
    const updateRecent = () => setRecentlyViewed(getRecentlyViewed());
    window.addEventListener("recently-viewed:changed", updateRecent);
    window.addEventListener("storage", updateRecent);
    return () => {
      window.removeEventListener("recently-viewed:changed", updateRecent);
      window.removeEventListener("storage", updateRecent);
    };
  }, []);

  const sortedBooks = useMemo(
    () => sortBooks(books, "createdAt", "desc"),
    [books]
  );
  const newestBooks = sortedBooks.slice(0, 10);
  const visibleBookIds = useMemo(() => new Set(books.map((book) => book.id)), [books]);
  const visibleRecentlyViewed = useMemo(
    () => recentlyViewed.filter((book) => visibleBookIds.has(book.id) && !book.isHidden),
    [recentlyViewed, visibleBookIds]
  );

  return (
    <main className="page-shell" >
      <div className="page-title-row">
        <div>
          <h1>Книги-новинки</h1>
          <p className="page-subtitle" style = {{marginBottom: 20}}>Свежая подборка книг из каталога.</p>
        </div>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : newestBooks.length === 0 ? (
        <div className="empty-state">Книги не найдены.</div>
      ) : (
        <BookGrid books={newestBooks} leaderSource={books} />
      )}

      {visibleRecentlyViewed.length > 0 && (
        <section className="recent-section">
          <div className="page-title-row" style = {{marginTop: 10}}>
            <div>
              <h1>Недавно просмотрено</h1>
              <p className="page-subtitle" style = {{marginBottom: 20}} >Последние книги, в которые вы заходили.</p>
            </div>
          </div>
          <BookGrid books={visibleRecentlyViewed.slice(0, 4)} leaderSource={books} />
        </section>
      )}
    </main>
  );
}

export default MainPage;
