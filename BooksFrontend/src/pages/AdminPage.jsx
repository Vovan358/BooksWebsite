import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  updateAdminBook,
} from "../api/api";
import PageSkeleton from "../components/PageSkeleton";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";
import { formatRelativeDate } from "../utils/date";

const PAGE_SIZE = 8;

const emptyBookForm = {
  title: "",
  author: "",
  price: 0,
  stock: 0,
  description: "",
  imageUrl: "",
};

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
          <NavLink to="/admin/comments">Комментарии</NavLink>
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
    ["Заказов", dashboard?.ordersCount ?? 0],
    ["Пользователей", dashboard?.usersCount ?? 0],
    ["Комментариев", dashboard?.commentsCount ?? 0],
    ["Куплено книг", dashboard?.booksBought ?? 0],
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
            <th>Username</th>
            <th>Роль</th>
            <th>Создан</th>
          </tr>
        </thead>
        <tbody>
          {(data?.items || []).map((user, index) => (
            <tr key={user.id}>
              <td>{(data.page - 1) * data.pageSize + index + 1}</td>
              <td>{user.username}</td>
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
            <th>User</th>
            <th>Date</th>
            <th>Books</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(data?.items || []).map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.username}</td>
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
      <AdminTitle title="Комментарии" subtitle="Модерация отзывов и жалоб." />
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
              <strong>#{(data.page - 1) * data.pageSize + index + 1}</strong>
              <span>{comment.username}</span>
              <span>{comment.bookName}</span>
              {comment.hasReports && <span className="report-badge">Жалоба</span>}
            </div>
            <p>{comment.description}</p>
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

  useEffect(() => {
    if (!menuBookId) return;
    const close = () => setMenuBookId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuBookId]);

  const openCreate = () => setEditingBook({ ...emptyBookForm });
  const openEdit = (book) =>
    setEditingBook({
      id: book.id,
      title: book.bookName,
      author: book.author,
      price: book.price,
      stock: book.stock,
      description: book.description,
      imageUrl: book.imageUrl,
    });

  const saveBook = async (book) => {
    if (book.id) {
      await updateAdminBook(book.id, book);
      showToast("Книга обновлена.");
    } else {
      await createAdminBook(book);
      showToast("Книга создана.");
    }
    setEditingBook(null);
    await onChanged();
    load();
  };

  const removeBook = async () => {
    try {
      await deleteAdminBook(deleteTarget.id);
      showToast("Книга удалена.");
      setDeleteTarget(null);
      await onChanged();
      load();
    } catch (error) {
      showToast(error.message || "Не удалось удалить книгу.", "error");
    }
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
        <button className="btn btn-primary" onClick={openCreate}>
          Создать книгу
        </button>
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
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.bookName}</td>
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
            <p className="page-subtitle">
              Вы точно хотите удалить книгу "{deleteTarget.bookName}" с маркетплейса?
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
            Название
            <input className="form-input" value={form.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label>
            Автор
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
            <input className="form-input" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} />
          </label>
          <label className="profile-form-wide">
            Загрузить обложку с компьютера
            <input className="form-input" type="file" accept="image/*" onChange={uploadCover} />
          </label>
          <label className="profile-form-wide">
            Описание
            <textarea className="form-textarea" value={form.description} onChange={(event) => update("description", event.target.value)} />
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
