import { useEffect, useState } from "react";
import { getMyOrders, getMyStats } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/books";

function PersonalPage() {
  const { user, logout, openAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [ordersData, statsData] = await Promise.all([
        getMyOrders(),
        getMyStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    };

    load();
  }, [user]);

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
    <main className="page-shell split-layout">
      <aside className="panel">
        <h2>{user}</h2>
        <button className="btn btn-danger" onClick={logout}>
          Выйти из аккаунта
        </button>

        {stats && (
          <div className="stat-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="stat-tile">
              <span className="stat-value">{stats.ordersCount}</span>
              <span className="stat-label">заказов</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{stats.booksBought}</span>
              <span className="stat-label">Количество купленных книг</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{stats.moneySpent} ₽</span>
              <span className="stat-label">Количество потраченных денег</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{stats.commentsLeft}</span>
              <span className="stat-label">Оставленных комментариев</span>
            </div>
          </div>
        )}
      </aside>

      <section>
        <div className="page-title-row">
          <div>
            <h1>История заказов</h1>
            <p className="page-subtitle">История заказов и состав покупок.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">Заказов пока нет.</div>
        ) : (
          orders.map((order) => (
            <article className="panel order-card" key={order.id}>
              <div className="page-title-row">
                <div>
                  <h2>{new Date(order.date).toLocaleString()}</h2>
                  <p className="page-subtitle">
                    {order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}
                  </p>
                </div>
                <span className="price">{order.totalPrice} ₽</span>
              </div>
              <div className="order-images">
                {order.items.slice(0, 3).map((item) => (
                  <img key={item.bookId} src={getImageUrl(item)} alt={item.title} />
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default PersonalPage;
