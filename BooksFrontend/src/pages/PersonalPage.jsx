import { useEffect, useMemo, useState } from "react";
import { getMyOrders, getMyStats } from "../api/api";
import BookGrid from "../components/BookGrid";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useProfile } from "../context/ProfileContext";
import { useToast } from "../context/ToastContext";
import { filterBooks, getImageUrl, paginate } from "../utils/books";
import { formatRelativeDate } from "../utils/date";
import { formatAddress } from "../utils/delivery";
import { PICKUP_POINTS } from "../utils/pickupPoints";
import { pluralRu } from "../utils/plural";

const PERSONAL_PAGE_SIZE = 3;

const EMPTY_PROFILE_FORM = {
  avatarUrl: "",
  description: "",
  email: "",
  country: "",
  city: "",
  street: "",
  house: "",
  apartment: "",
  pickupPoint: PICKUP_POINTS[0],
  showFavorites: true,
  showOrderHistory: false,
  showStats: true,
};

function toProfileForm(profile) {
  return {
    ...EMPTY_PROFILE_FORM,
    avatarUrl: profile?.avatarUrl || "",
    description: profile?.description || "",
    email: profile?.email || "",
    country: profile?.country || "",
    city: profile?.city || "",
    street: profile?.street || "",
    house: profile?.house || "",
    apartment: profile?.apartment || "",
    pickupPoint: PICKUP_POINTS.includes(profile?.pickupPoint)
      ? profile.pickupPoint
      : PICKUP_POINTS[0],
    showFavorites: profile?.showFavorites ?? true,
    showOrderHistory: profile?.showOrderHistory ?? false,
    showStats: profile?.showStats ?? true,
  };
}

function filterOrders(orders, search) {
  const query = search.trim().toLowerCase();
  if (!query) return orders;

  return orders.filter((order) => {
    const books = order.items
      .map((item) => `${item.title} ${item.author}`)
      .join(" ")
      .toLowerCase();
    const date = new Date(order.date).toLocaleString().toLowerCase();
    return books.includes(query) || date.includes(query);
  });
}

function PersonalPage() {
  const { user, logout, openAuth } = useAuth();
  const navigate = useNavigate();
  const { favorites, refreshFavorites } = useFavorites();
  const { profile, loading: profileLoading, saveProfile } = useProfile();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [favoritePage, setFavoritePage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isEditingDescription, setEditingDescription] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [ordersData, statsData] = await Promise.all([
        getMyOrders(),
        getMyStats(),
        refreshFavorites(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    };

    load();
  }, [refreshFavorites, user]);

  useEffect(() => {
    if (!profile) return;
    const nextForm = toProfileForm(profile);
    setProfileForm(nextForm);
    setDescriptionDraft(nextForm.description);
  }, [profile]);

  useEffect(() => {
    setFavoritePage(1);
  }, [favoriteSearch]);

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch]);

  const filteredFavorites = useMemo(
    () => filterBooks(favorites, favoriteSearch),
    [favorites, favoriteSearch]
  );

  const filteredOrders = useMemo(
    () => filterOrders(orders, orderSearch),
    [orders, orderSearch]
  );

  const favoritePageData = paginate(filteredFavorites, favoritePage, PERSONAL_PAGE_SIZE);
  const orderPageData = paginate(filteredOrders, orderPage, PERSONAL_PAGE_SIZE);

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfileForm = async (nextForm = profileForm) => {
    if (nextForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email)) {
      showToast("Введите корректный email.", "error");
      return;
    }

    try {
      await saveProfile(nextForm);
      showToast("Профиль сохранён.");
    } catch {
      showToast("Не удалось сохранить профиль.", "error");
    }
  };

  const saveDescription = async () => {
    const nextDescription = descriptionDraft.trim().slice(0, 60);
    const nextForm = { ...profileForm, description: nextDescription };
    setProfileForm(nextForm);
    setEditingDescription(false);
    await saveProfileForm(nextForm);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const nextForm = { ...profileForm, avatarUrl: reader.result };
      setProfileForm(nextForm);
      await saveProfileForm(nextForm);
    };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <main className="page-shell">
        <div className="empty-state inline-auth-prompt">
          <button className="btn btn-success" onClick={openAuth}>
            Войдите
          </button>
          <span>чтобы открыть личный кабинет.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell split-layout personal-layout">
      <aside className="panel personal-sidebar">
        <label className="avatar-upload">
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {profileForm.avatarUrl ? (
            <img src={profileForm.avatarUrl} alt={user} />
          ) : (
            <span>{user.slice(0, 1).toUpperCase()}</span>
          )}
          <span className="avatar-upload-overlay">Выбрать фото</span>
        </label>

        <h2>{user}</h2>

        <div className="description-field">
          {isEditingDescription ? (
            <>
              <textarea
                className="form-textarea"
                maxLength={60}
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
              />
              <button className="description-action" onClick={saveDescription} type="button">
                ✓
              </button>
            </>
          ) : (
            <>
              <p>{profileForm.description || "Описание профиля"}</p>
              <button
                className="description-action"
                onClick={() => {
                  setDescriptionDraft(profileForm.description);
                  setEditingDescription(true);
                }}
                type="button"
                aria-label="Редактировать описание"
              >
                ✎
              </button>
            </>
          )}
          <span className="description-counter">
            {(isEditingDescription ? descriptionDraft : profileForm.description).length}/60
          </span>
        </div>

        <button
          className="btn btn-danger"
          onClick={async () => {
            await logout();
            navigate("/auth", { replace: true });
          }}
        >
          Выйти из аккаунта
        </button>

        {stats && (
          <div className="stat-grid personal-stat-grid">
            <div className="stat-tile">
              <span className="stat-value">{stats.ordersCount}</span>
              <span className="stat-label">
                {pluralRu(stats.ordersCount, "заказ", "заказа", "заказов")}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{stats.booksBought}</span>
              <span className="stat-label">
                {stats.booksBought === 1 ? "книга куплена" : "книг куплено"}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{stats.moneySpent} ₽</span>
              <span className="stat-label">Потрачено</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{stats.commentsLeft}</span>
              <span className="stat-label">
                {pluralRu(stats.commentsLeft, "отзыв", "отзыва", "отзывов")}
              </span>
            </div>
          </div>
        )}
      </aside>

      <section className="personal-content">
        <section className="panel personal-section">
          <div className="page-title-row">
            <div>
              <h1>Личные данные</h1>
              <p className="page-subtitle">Email, адрес и пункт выдачи для заказов.</p>
            </div>
            <button
              className="btn btn-success"
              disabled={profileLoading}
              onClick={() => saveProfileForm()}
              type="button"
            >
              Сохранить
            </button>
          </div>

          <div className="profile-form-grid">
            <label>
              Email
              <input
                className="form-input"
                type="email"
                value={profileForm.email}
                onChange={(event) => updateProfileField("email", event.target.value)}
              />
            </label>
            <label>
              Страна
              <input
                className="form-input"
                value={profileForm.country}
                onChange={(event) => updateProfileField("country", event.target.value)}
              />
            </label>
            <label>
              Город
              <input
                className="form-input"
                value={profileForm.city}
                onChange={(event) => updateProfileField("city", event.target.value)}
              />
            </label>
            <label>
              Улица
              <input
                className="form-input"
                value={profileForm.street}
                onChange={(event) => updateProfileField("street", event.target.value)}
              />
            </label>
            <label>
              Дом
              <input
                className="form-input"
                value={profileForm.house}
                onChange={(event) => updateProfileField("house", event.target.value)}
              />
            </label>
            <label>
              Квартира
              <input
                className="form-input"
                value={profileForm.apartment}
                onChange={(event) => updateProfileField("apartment", event.target.value)}
              />
            </label>
            <label className="profile-form-wide">
              Предпочитаемый пункт выдачи
              <select
                className="select-input"
                value={profileForm.pickupPoint}
                onChange={(event) => updateProfileField("pickupPoint", event.target.value)}
              >
                {PICKUP_POINTS.map((point) => (
                  <option key={point} value={point}>
                    {point}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="panel personal-section">
          <div className="page-title-row">
            <div>
              <h1>Настройки приватности</h1>
              <p className="page-subtitle">Что будет видно другим пользователям.</p>
            </div>
          </div>

          <div className="privacy-list">
            {[
              ["showFavorites", "Показывать список избранных книг"],
              ["showOrderHistory", "Показывать историю заказов"],
              ["showStats", "Показывать статистику"],
            ].map(([field, label]) => (
              <button
                className={`privacy-toggle ${profileForm[field] ? "is-on" : ""}`}
                key={field}
                type="button"
                onClick={() => {
                  const nextForm = { ...profileForm, [field]: !profileForm[field] };
                  setProfileForm(nextForm);
                  saveProfileForm(nextForm);
                }}
              >
                <span>{label}</span>
                <span className="privacy-switch" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel personal-section">
          <div className="page-title-row">
            <div>
              <h1>Избранное</h1>
              <p className="page-subtitle">Книги, которые вы сохранили.</p>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              type="search"
              placeholder="Поиск по избранному"
              value={favoriteSearch}
              onChange={(event) => setFavoriteSearch(event.target.value)}
            />
            <span className="muted">Найдено: {filteredFavorites.length}</span>
          </div>

          {favorites.length === 0 ? (
            <div className="empty-state">В избранном пока нет книг.</div>
          ) : favoritePageData.items.length === 0 ? (
            <div className="empty-state">Книги не найдены.</div>
          ) : (
            <>
              <BookGrid books={favoritePageData.items} leaderSource={favorites} />
              <Pagination
                page={favoritePageData.page}
                totalPages={favoritePageData.totalPages}
                onPageChange={setFavoritePage}
              />
            </>
          )}
        </section>

        <section className="personal-section">
          <div className="page-title-row">
            <div>
              <h1>История заказов</h1>
              <p className="page-subtitle">История заказов и состав покупок.</p>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              type="search"
              placeholder="Поиск по заказам"
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
            />
            <span className="muted">Найдено: {filteredOrders.length}</span>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">Заказов пока нет.</div>
          ) : orderPageData.items.length === 0 ? (
            <div className="empty-state">Заказы не найдены.</div>
          ) : (
            <>
              {orderPageData.items.map((order) => (
                <article className="panel order-card" key={order.id}>
                  <div className="page-title-row">
                    <div>
                      <h2>{formatRelativeDate(order.date)}</h2>
                      <p className="page-subtitle">
                        {order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div className="order-summary-side">
                      <span className="price">{order.totalPrice} ₽</span>
                      <span className="muted">
                        {order.deliveryAddress
                          ? formatAddress([order.deliveryAddress])
                          : "Адрес доставки не указан."}
                      </span>
                    </div>
                  </div>
                  <div className="order-images">
                    {order.items.slice(0, 3).map((item) => (
                      <img key={item.bookId} src={getImageUrl(item)} alt={item.title} />
                    ))}
                  </div>
                </article>
              ))}
              <Pagination
                page={orderPageData.page}
                totalPages={orderPageData.totalPages}
                onPageChange={setOrderPage}
              />
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default PersonalPage;
