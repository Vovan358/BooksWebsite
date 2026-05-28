import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  clearAdminBookComments,
  createAdminBook,
  deleteAdminBook,
  deleteAdminComment,
  getAdminBooks,
  getAdminComments,
  getAdminDashboard,
  getAdminOrders,
  getAdminUsers,
  setAdminBookHidden,
  updateAdminBook,
} from "../api/api";
import { getImageUrl } from "../utils/books";
import PageSkeleton from "../components/PageSkeleton";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";
import { formatRelativeDate } from "../utils/date";
import { pluralRu } from "../utils/plural";
import { removeRecentlyViewed } from "../utils/recentlyViewed";

const PAGE_SIZE = 8;

const emptyBookForm = {
  title: "",
  author: "",
  price: 0,
  stock: 0,
  description: "",
  imageUrl: "",
};

function emitBooksChanged() {
  window.dispatchEvent(new CustomEvent("books:changed"));
}

function detectCsvDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;

  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsvRows(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);

  return rows;
}

function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const section = location.pathname.split("/")[2] || "users";
  const [dashboard, setDashboard] = useState(null);

  const refreshDashboard = async () => {
    setDashboard(await getAdminDashboard());
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  useEffect(() => {
    if (location.pathname === "/admin") {
      const savedSection = localStorage.getItem("booksWebsiteAdminSection") || "users";
      navigate(`/admin/${savedSection}`, { replace: true });
    } else if (section) {
      localStorage.setItem("booksWebsiteAdminSection", section);
    }
  }, [location.pathname, navigate]);

  return (
    <main className="page-shell admin-page">
      <aside className="panel admin-sidebar">
        <h2>Админ-панель</h2>
        <nav>
          <NavLink to="/admin/users">Пользователи</NavLink>
          <NavLink to="/admin/orders">Заказы</NavLink>
          <NavLink to="/admin/comments">Отзывы</NavLink>
          <NavLink to="/admin/books">Книги</NavLink>
        </nav>
      </aside>

      <section className="admin-content">
        <Dashboard dashboard={dashboard} />

        {section === "orders" && <AdminOrders />}
        {section === "comments" && (
          <AdminComments onChanged={refreshDashboard} showToast={showToast} />
        )}
        {section === "books" && (
          <AdminBooks onChanged={refreshDashboard} showToast={showToast} />
        )}
        {section === "users" && <AdminUsers />}
      </section>
    </main>
  );
}

function Dashboard({ dashboard }) {
  const items = [
    ["Выручка", `${dashboard?.revenue ?? 0} ₽`],
    [pluralRu(dashboard?.ordersCount ?? 0, "заказ", "заказа", "заказов"), dashboard?.ordersCount ?? 0],
    [pluralRu(dashboard?.usersCount ?? 0, "пользователь", "пользователя", "пользователей"), dashboard?.usersCount ?? 0],
    [pluralRu(dashboard?.commentsCount ?? 0, "отзыв", "отзыва", "отзывов"), dashboard?.commentsCount ?? 0],
    [pluralRu(dashboard?.booksBought ?? 0, "книга куплена", "книги куплено", "книг куплено"), dashboard?.booksBought ?? 0],
    ["Средний рейтинг", (dashboard?.averageBookRating ?? 0).toFixed(1)],
  ];

  return (
    <section className="admin-dashboard">
      {items.map(([label, value]) => (
        <div className="stat-tile" key={label}>
          <span className="stat-value">{value}</span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </section>
  );
}

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminUsers({
      search,
      sortBy: "createdAt",
      direction,
      page,
      pageSize: PAGE_SIZE,
    }).then(setData).finally(() => setLoading(false));
  }, [direction, page, search]);

  return (
    <section className="panel">
      <AdminTitle title="Пользователи" subtitle="Поиск и сортировка по дате регистрации." />
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по username"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <DirectionButton direction={direction} setDirection={setDirection} />
      </div>
      {loading ? <PageSkeleton /> : <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Пользователь</th>
            <th>Роль</th>
            <th>Создан</th>
          </tr>
        </thead>
        <tbody>
          {(data?.items || []).map((user, index) => (
            <tr key={user.id}>
              <td>{(data.page - 1) * data.pageSize + index + 1}</td>
              <td>
                <Link
                  className="review-author-link"
                  to={`/users/${user.id}`}
                  state={{ username: user.username }}
                >
                  {user.username}
                </Link>
              </td>
              <td>{user.role}</td>
              <td>{formatRelativeDate(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />
    </section>
  );
}

function AdminOrders() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminOrders({ search, sortBy, direction, page, pageSize: PAGE_SIZE })
      .then(setData)
      .finally(() => setLoading(false));
  }, [direction, page, search, sortBy]);

  return (
    <section className="panel">
      <AdminTitle title="Заказы" subtitle="Поиск по покупателю и сортировка заказов." />
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по username"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <div className="sort-control">
          <DirectionButton direction={direction} setDirection={setDirection} />
          <select className="select-input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date">Дата заказа</option>
            <option value="itemsCount">Количество товаров</option>
            <option value="totalPrice">Общая сумма</option>
          </select>
        </div>
      </div>
      {loading ? <PageSkeleton /> : <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Пользователь</th>
            <th>Дата</th>
            <th>Состав заказа</th>
            <th>Итого</th>
          </tr>
        </thead>
        <tbody>
          {(data?.items || []).map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                <Link
                  className="review-author-link"
                  to={`/users/${order.userId}`}
                  state={{ username: order.username }}
                >
                  {order.username}
                </Link>
              </td>
              <td>{formatRelativeDate(order.date)}</td>
              <td>{order.books.map((book) => `${book.title} x${book.quantity}`).join(", ")}</td>
              <td>{order.totalPrice} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />
    </section>
  );
}

function AdminComments({ onChanged, showToast }) {
  const [search, setSearch] = useState("");
  const [onlyReported, setOnlyReported] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminComments({ search, onlyReported, page, pageSize: PAGE_SIZE })
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [onlyReported, page, search]);

  const removeComment = async (comment) => {
    await deleteAdminComment(comment.id);
    showToast("Комментарий удалён.");
    await onChanged();
    load();
  };

  return (
    <section className="panel">
      <AdminTitle title="Отзывы" subtitle="Модерация отзывов и жалоб." />
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по username"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <button
          className={onlyReported ? "btn btn-danger" : "btn btn-ghost"}
          onClick={() => {
            setOnlyReported((current) => !current);
            setPage(1);
          }}
        >
          {onlyReported ? "Жалобы" : "Все"}
        </button>
      </div>
      {loading ? <PageSkeleton /> : <div className="admin-comment-list">
        {(data?.items || []).map((comment, index) => (
          <article
            className={`admin-comment-card ${comment.hasReports ? "has-report" : ""}`}
            key={comment.id}
          >
            <button
              className="comment-delete-button"
              type="button"
              onClick={() => removeComment(comment)}
              title="Удалить комментарий"
            >
              ×
            </button>
            <div className="admin-comment-head">
              <Link
                className="review-author-link"
                to={`/books/${comment.bookId}#comment-${comment.id}`}
                state={{ from: "/admin/comments", bookTitle: comment.bookName }}
              >
                #{(data.page - 1) * data.pageSize + index + 1}
              </Link>
              {comment.userId ? (
                <Link
                  className="review-author-link"
                  to={`/users/${comment.userId}`}
                  state={{ username: comment.username }}
                >
                  {comment.username}
                </Link>
              ) : (
                <span>{comment.username}</span>
              )}
              <Link
                className="review-author-link"
                to={`/books/${comment.bookId}`}
                state={{ from: "/admin/comments", bookTitle: comment.bookName }}
              >
                {comment.bookName}
              </Link>
              {comment.hasReports && <span className="report-badge">Жалоба</span>}
            </div>
            <p className="admin-comment-text" title={comment.description}>
              {comment.description}
            </p>
            <div className="button-row">
              <span className="muted">Оценка: {comment.rating}/10</span>
              <span className={`comment-score ${comment.commentRating > 0 ? "comment-score-positive" : comment.commentRating < 0 ? "comment-score-negative" : ""}`}>
                {comment.commentRating > 0 ? `+${comment.commentRating}` : comment.commentRating}
              </span>
            </div>
          </article>
        ))}
      </div>}
      <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />
    </section>
  );
}

function AdminBooks({ onChanged, showToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuBookId, setMenuBookId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    getAdminBooks({ search, page, pageSize: PAGE_SIZE })
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, search]);

  const openEdit = (book) =>
    setEditingBook({
      id: book.id,
      title: book.bookName,
      author: book.author,
      price: book.price,
      stock: book.stock,
      description: book.description,
      imageUrl: book.imageUrl,
      isHidden: book.isHidden,
    });

  useEffect(() => {
    const editBookId = Number(location.state?.editBookId);
    if (!editBookId || !data?.items) return;

    const book = data.items.find((item) => item.id === editBookId);
    if (book) {
      openEdit(book);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [data, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!menuBookId) return;
    const close = () => setMenuBookId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuBookId]);

  const openCreate = () => setEditingBook({ ...emptyBookForm });

  const saveBook = async (book) => {
    if (!book.title.trim()) {
      showToast("Заполните название книги.", "error");
      return;
    }

    if (!book.author.trim()) {
      showToast("Заполните автора книги.", "error");
      return;
    }

    if (book.id) {
      await updateAdminBook(book.id, book);
      showToast("Книга обновлена.");
    } else {
      await createAdminBook(book);
      showToast("Книга создана.");
    }
    emitBooksChanged();
    setEditingBook(null);
    await onChanged();
    load();
  };

  const removeBook = async () => {
    try {
      await deleteAdminBook(deleteTarget.id);
      showToast("Книга удалена.");
      removeRecentlyViewed(deleteTarget.id);
      window.dispatchEvent(
        new CustomEvent("book:deleted", {
          detail: { bookId: deleteTarget.id },
        })
      );
      emitBooksChanged();
      setDeleteTarget(null);
      await onChanged();
      load();
    } catch (error) {
      const hasOrders = (error.message || "").includes("orders");
      showToast(
        hasOrders
          ? "Книгу нельзя удалить: по ней уже есть заказы."
          : "Не удалось удалить книгу.",
        "error"
      );
    }
  };

  const toggleHidden = async (book) => {
    await setAdminBookHidden(book.id, !book.isHidden);
    showToast(book.isHidden ? "Книга снова продаётся." : "Продажи книги прекращены.");
    emitBooksChanged();
    await onChanged();
    load();
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const delimiter = detectCsvDelimiter(text);
    const [rawHeaders, ...lines] = parseCsvRows(text, delimiter);
    const headers = rawHeaders?.map((header) => header.replace(/^\uFEFF/, "").trim()) || [];
    if (!headers?.length) {
      showToast("CSV-файл пустой или без заголовков.", "error");
      event.target.value = "";
      return;
    }

    let imported = 0;

    for (const values of lines) {
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
      const book = {
        title: row.title || row.Title || row.name || row.Name || "",
        author: row.author || row.Author || "",
        price: Number(row.price || row.Price || 0),
        stock: Number(row.stock || row.Stock || 0),
        description: row.description || row.Description || "",
        imageUrl: row.imageUrl || row.ImageUrl || "",
        isHidden: false,
      };

      if (book.title && book.author) {
        await createAdminBook(book);
        imported += 1;
      }
    }

    showToast(`Импортировано книг: ${imported}.`);
    emitBooksChanged();
    await onChanged();
    load();
    event.target.value = "";
  };

  const clearComments = async (bookId) => {
    await clearAdminBookComments(bookId);
    showToast("Отзывы очищены.");
    await onChanged();
    load();
  };

  return (
    <section className="panel">
      <AdminTitle title="Книги" subtitle="Создание, редактирование и удаление книг." />
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по названию или автору"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <div className="button-row">
          <label className="btn btn-ghost file-import-button">
            Импорт CSV
            <input type="file" accept=".csv,text/csv" onChange={importCsv} />
          </label>
          <button className="btn btn-primary" onClick={openCreate}>
            Создать книгу
          </button>
        </div>
      </div>
      {loading ? <PageSkeleton /> : <table className="data-table admin-books-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Название</th>
            <th>Автор</th>
            <th>Оценка</th>
            <th>Заказов</th>
            <th>Наличие</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(data?.items || []).map((book, index) => (
            <tr className={book.isHidden ? "admin-hidden-book-row" : ""} key={book.id}>
              <td>{book.id}</td>
              <td>
                <Link
                  className="review-author-link"
                  to={`/books/${book.id}`}
                  state={{ from: "/admin/books", bookTitle: book.bookName }}
                >
                  {book.bookName}
                </Link>
              </td>
              <td>{book.author}</td>
              <td>{book.rating.toFixed(1)}</td>
              <td>{book.orders}</td>
              <td>{book.stock}</td>
              <td className="admin-actions-cell">
                <button
                  className="admin-dots"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuBookId((current) => (current === book.id ? null : book.id));
                  }}
                >
                  ...
                </button>
                {menuBookId === book.id && (
                  <div className="admin-row-menu" onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => openEdit(book)}>Редактировать</button>
                    <button onClick={() => toggleHidden(book)}>
                      {book.isHidden ? "Показать" : "Скрыть"}
                    </button>
                    <button onClick={() => setDeleteTarget(book)}>Удалить</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />

      {editingBook && (
        <BookEditor
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={saveBook}
          onClearComments={clearComments}
        />
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay">
          
          <section className="panel admin-modal">
            <h2>Удалить книгу?</h2>
            
            <p className="page-subtitle" style={{marginBottom: 10}}>
            
              Вы точно хотите удалить книгу "{deleteTarget.bookName}" с маркетплейса?<br />
              Внимание! Удалить можно только ту книгу, которую ещё не заказывали!
            </p>
            <div className="button-row">
              <button className="btn btn-danger" onClick={removeBook}>Удалить</button>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Отмена</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function BookEditor({ book, onClose, onSave, onClearComments }) {
  const [form, setForm] = useState(book);
  const isExisting = Boolean(book.id);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadCover = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => update("imageUrl", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="admin-modal-overlay">
      <section className="panel admin-modal">
        <h2>{isExisting ? "Редактировать книгу" : "Создать книгу"}</h2>
        <div className="profile-form-grid">
          <label>
            <span>Название<span className="required-mark">*</span></span>
            <input className="form-input" value={form.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label>
            <span>Автор<span className="required-mark">*</span></span>
            <input className="form-input" value={form.author} onChange={(event) => update("author", event.target.value)} />
          </label>
          <label>
            Цена
            <input className="form-input" type="number" value={form.price} onChange={(event) => update("price", Number(event.target.value))} />
          </label>
          <label>
            В наличии
            <input className="form-input" type="number" value={form.stock} onChange={(event) => update("stock", Number(event.target.value))} />
          </label>
          <label className="profile-form-wide">
            Обложка
            <input
              className="form-input"
              placeholder="URL обложки или data:image..."
              value={form.imageUrl.startsWith("data:image") ? "Изображение загружено с компьютера" : form.imageUrl}
              onChange={(event) => update("imageUrl", event.target.value)}
            />
          </label>
          <label className="profile-form-wide">
            Загрузить обложку с компьютера
            <input className="form-input" type="file" accept="image/*" onChange={uploadCover} />
          </label>
          {form.imageUrl && (
            <img
              className="admin-cover-preview"
              src={getImageUrl(form)}
              alt="Предпросмотр обложки"
            />
          )}
          <label className="profile-form-wide">
            Описание
            <textarea
              className="form-textarea"
              maxLength={1000}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
            <span className="muted">{form.description.length}/1000</span>
          </label>
        </div>
        <div className="button-row admin-modal-actions">
          <button className="btn btn-success" onClick={() => onSave(form)}>Сохранить</button>
          {isExisting && (
            <button className="btn btn-danger" onClick={() => onClearComments(form.id)}>
              Очистить отзывы
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        </div>
      </section>
    </div>
  );
}

function DirectionButton({ direction, setDirection }) {
  return (
    <button
      className={`sort-direction-button ${direction === "desc" ? "is-desc" : ""}`}
      onClick={() => setDirection((current) => (current === "asc" ? "desc" : "asc"))}
      title={direction === "asc" ? "По возрастанию" : "По убыванию"}
    >
      ▲
    </button>
  );
}

function AdminTitle({ title, subtitle }) {
  return (
    <div className="page-title-row">
      <div>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

export default AdminPage;
