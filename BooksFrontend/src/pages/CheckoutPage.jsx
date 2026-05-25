import { useState } from "react";
import { Link } from "react-router-dom";
import { createOrder } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function CheckoutPage() {
  const { user, openAuth } = useAuth();
  const { items, totalCount, totalPrice, clearCart } = useCart();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setError("");

    if (!user) {
      openAuth();
      return;
    }

    try {
      await createOrder(
        items.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
        }))
      );
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Не удалось оформить заказ");
    }
  };

  return (
    <main className="page-shell">
      <div className="page-title-row">
        <div>
          <h1>Оформление заказа</h1>
          <p className="page-subtitle">Подтвердите состав заказа.</p>
        </div>
        <Link className="btn btn-ghost" to="/cart">
          Back to cart
        </Link>
      </div>

      {success && <div className="notice">Заказ оформлен!</div>}
      {error && <div className="notice">{error}</div>}

      <section className="panel">
        <h2>OrderInfo</h2>
        {items.length === 0 ? (
          <p className="page-subtitle">Корзина пуста.</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Книга</th>
                  <th>Количество</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.bookId}>
                    <td>{item.title}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price * item.quantity} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="stat-grid">
              <div className="stat-tile">
                <span className="stat-value">{totalCount}</span>
                <span className="stat-label">books</span>
              </div>
              <div className="stat-tile">
                <span className="stat-value">{totalPrice} ₽</span>
                <span className="stat-label">total</span>
              </div>
            </div>
            {!user && (
              <p className="page-subtitle">Для оформления заказа нужно войти.</p>
            )}
            <button className="btn btn-success" onClick={handleCheckout}>
              CheckOut
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default CheckoutPage;
