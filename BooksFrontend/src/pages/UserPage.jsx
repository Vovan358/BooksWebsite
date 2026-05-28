import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicUserProfile } from "../api/api";
import BookGrid from "../components/BookGrid";
import Pagination from "../components/Pagination";
import { filterBooks, getImageUrl, paginate } from "../utils/books";
import { formatRelativeDate } from "../utils/date";
import { formatAddress } from "../utils/delivery";

const PAGE_SIZE = 3;

function UserPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [favoritePage, setFavoritePage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPublicUserProfile(id);
      setProfile(data);
      setLoading(false);
    };

    load();
  }, [id]);

  useEffect(() => {
    setFavoritePage(1);
  }, [favoriteSearch]);

  const filteredFavorites = useMemo(
    () => filterBooks(profile?.favoriteBooks || [], favoriteSearch),
    [favoriteSearch, profile]
  );

  const favoritePageData = paginate(filteredFavorites, favoritePage, PAGE_SIZE);
  const orderPageData = paginate(profile?.orders || [], orderPage, PAGE_SIZE);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="empty-state">Загрузка профиля...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page-shell">
        <div className="empty-state">Пользователь не найден.</div>
      </main>
    );
  }

  return (
    <main className="page-shell user-page">
      <section className="panel user-profile-card">
        <div className="user-avatar-preview user-avatar-large">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.username} />
          ) : (
            <span>{profile.username?.slice(0, 1)?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <h1>{profile.username}</h1>
          <p className="page-subtitle">
            {profile.description || "Пользователь пока не добавил описание."}
          </p>
        </div>
      </section>

      <section className="panel personal-section">
        <div className="page-title-row">
          <div>
            <h1>Статистика</h1>
            <p className="page-subtitle">Публичные показатели пользователя.</p>
          </div>
        </div>

        {profile.canViewStats && profile.stats ? (
          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-value">{profile.stats.ordersCount}</span>
              <span className="stat-label">Заказов</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{profile.stats.booksBought}</span>
              <span className="stat-label">Куплено книг</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{profile.stats.moneySpent} ₽</span>
              <span className="stat-label">Потрачено</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{profile.stats.commentsLeft}</span>
              <span className="stat-label">Отзывов</span>
            </div>
          </div>
        ) : (
          <div className="empty-state">Пользователь скрыл статистику.</div>
        )}
      </section>

      <section className="panel personal-section">
        <div className="page-title-row">
          <div>
            <h1>Избранное</h1>
            <p className="page-subtitle">Книги, которые сохранил пользователь.</p>
          </div>
        </div>

        {profile.canViewFavorites ? (
          <>
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
            {favoritePageData.items.length === 0 ? (
              <div className="empty-state">В избранном пока нет книг.</div>
            ) : (
              <>
                <BookGrid
                  books={favoritePageData.items}
                  leaderSource={profile.favoriteBooks}
                />
                <Pagination
                  page={favoritePageData.page}
                  totalPages={favoritePageData.totalPages}
                  onPageChange={setFavoritePage}
                />
              </>
            )}
          </>
        ) : (
          <div className="empty-state">Пользователь скрыл избранное.</div>
        )}
      </section>

      <section className="personal-section">
        <div className="page-title-row">
          <div>
            <h1>История заказов</h1>
            <p className="page-subtitle">Покупки пользователя, если он открыл доступ.</p>
          </div>
        </div>

        {profile.canViewOrderHistory ? (
          orderPageData.items.length === 0 ? (
            <div className="empty-state">Заказов пока нет.</div>
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
          )
        ) : (
          <div className="empty-state">Пользователь скрыл историю заказов.</div>
        )}
      </section>
    </main>
  );
}

export default UserPage;
