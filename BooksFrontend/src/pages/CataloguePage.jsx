import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getBooks } from "../api/api";
import BookGrid from "../components/BookGrid";
import PageSkeleton from "../components/PageSkeleton";
import Pagination from "../components/Pagination";
import { useFavorites } from "../context/FavoritesContext";
import { filterBooks, paginate, PAGE_SIZE, sortBooks } from "../utils/books";

const SORT_OPTIONS = new Set([
  "cost",
  "stock",
  "soldCount",
  "favoritesCount",
  "commentsNumber",
  "averageRating",
  "author",
  "name",
]);

function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { revision: favoritesRevision } = useFavorites();

  const search = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "name";
  const sortBy = SORT_OPTIONS.has(sortParam) ? sortParam : "name";
  const sortDirection = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const onlyAvailable = searchParams.get("available") === "1";
  const onlyReviewed = searchParams.get("reviewed") === "1";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const updateCatalogueParams = (updates) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      const data = await getBooks();
      setBooks(data);
      setLoading(false);
    };

    load();
  }, [favoritesRevision]);

  const visibleBooks = useMemo(() => {
    let next = filterBooks(books, search);
    if (onlyAvailable) next = next.filter((book) => book.stock > 0);
    if (onlyReviewed) next = next.filter((book) => (book.commentsNumber || 0) > 0);
    return sortBooks(next, sortBy, sortDirection);
  }, [books, onlyAvailable, onlyReviewed, search, sortBy, sortDirection]);

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
          onChange={(e) =>
            updateCatalogueParams({ q: e.target.value, page: 1 })
          }
        />
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => setSearchParams({})}
        >
          Очистить фильтры
        </button>
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
              updateCatalogueParams({
                dir: sortDirection === "asc" ? "desc" : "asc",
                page: 1,
              })
            }
          >
            ▲
          </button>
          <select
            className="select-input"
            value={sortBy}
            onChange={(e) =>
              updateCatalogueParams({ sort: e.target.value, page: 1 })
            }
          >
            <option value="cost">Цена</option>
            <option value="stock">Наличие</option>
            <option value="soldCount">Количество заказов</option>
            <option value="favoritesCount">Количество в избранном</option>
            <option value="commentsNumber">Количество отзывов</option>
            <option value="averageRating">Средний рейтинг</option>
            <option value="author">Автор</option>
            <option value="name">Название</option>
          </select>
        </div>
      </div>

      <div className="filter-scroll-row">
        <button
          className={`filter-chip ${onlyAvailable ? "is-active" : ""}`}
          type="button"
          onClick={() =>
            updateCatalogueParams({
              available: onlyAvailable ? "" : "1",
              page: 1,
            })
          }
        >
          Только в наличии
        </button>
        <button
          className={`filter-chip ${onlyReviewed ? "is-active" : ""}`}
          type="button"
          onClick={() =>
            updateCatalogueParams({
              reviewed: onlyReviewed ? "" : "1",
              page: 1,
            })
          }
        >
          Только с отзывами
        </button>
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
            onPageChange={(nextPage) =>
              updateCatalogueParams({ page: nextPage })
            }
          />
        </>
      )}
    </main>
  );
}

export default CataloguePage;
