import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, getBooks } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProfile } from "../context/ProfileContext";

const PICKUP_POINTS = [
  "Москва, Тверская улица, 7",
  "Санкт-Петербург, Невский проспект, 28",
  "Казань, улица Баумана, 12",
];

function getDeliveryDays(country, city) {
  const normalizedCountry = country.trim().toLowerCase();
  const normalizedCity = city.trim().toLowerCase();

  if (normalizedCountry && normalizedCountry !== "россия") return 14;
  if (normalizedCity === "москва") return 1;
  return 3;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalCount, totalPrice, clearCart, syncWithBooks } = useCart();
  const { profile } = useProfile();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [syncNotice, setSyncNotice] = useState("");
  const [deliveryType, setDeliveryType] = useState("home");
  const [checkoutInfo, setCheckoutInfo] = useState({
    email: "",
    country: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
    pickupPoint: PICKUP_POINTS[0],
  });

  useEffect(() => {
    const syncCart = async () => {
      const books = await getBooks();
      syncWithBooks(books, () => {
        setSyncNotice("Корзина обновлена по актуальным данным.");
      });
    };

    syncCart();
  }, [syncWithBooks]);

  useEffect(() => {
    if (!profile) return;

    setCheckoutInfo({
      email: profile.email || "",
      country: profile.country || "",
      city: profile.city || "",
      street: profile.street || "",
      house: profile.house || "",
      apartment: profile.apartment || "",
      pickupPoint: profile.pickupPoint || PICKUP_POINTS[0],
    });
  }, [profile]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleCheckout = async () => {
    setError("");

    if (!user) {
      navigate("/auth", { state: { from: "/checkout" } });
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

  const updateCheckoutField = (field, value) => {
    setCheckoutInfo((current) => ({ ...current, [field]: value }));
  };

  const deliveryDays = getDeliveryDays(checkoutInfo.country, checkoutInfo.city);
  const isPickup = deliveryType === "pickup";

  return (
    <main className="page-shell">
      <div className="page-title-row">
        <div>
          <h1>Оформление заказа</h1>
          <p className="page-subtitle">Подтвердите состав заказа.</p>
        </div>
        <Link className="btn btn-ghost" to="/cart">
          Назад
        </Link>
      </div>

      {success && <div className="notice">Заказ оформлен!</div>}
      {error && <div className="notice">{error}</div>}
      {syncNotice && <div className="notice">{syncNotice}</div>}

      <section className="panel">
        <h2>Сводка о заказе</h2>
        {items.length === 0 ? (
          <p className="page-subtitle">Корзина пуста.</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Название книги</th>
                  <th>Количество</th>
                  <th>Стоимость</th>
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
                <span className="stat-label">Книг</span>
              </div>
              <div className="stat-tile">
                <span className="stat-value">{totalPrice} ₽</span>
                <span className="stat-label">Сумма заказа</span>
              </div>
              <div className="stat-tile">
                <span className="stat-value">{deliveryDays}</span>
                <span className="stat-label">Дней доставки</span>
              </div>
            </div>

            <section className="checkout-details">
              <div className="profile-form-grid">
                <label className="profile-form-wide">
                  Email
                  <input
                    className="form-input"
                    type="email"
                    value={checkoutInfo.email}
                    onChange={(event) =>
                      updateCheckoutField("email", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="delivery-switch">
                <button
                  className={deliveryType === "home" ? "is-active" : ""}
                  type="button"
                  onClick={() => setDeliveryType("home")}
                >
                  Доставка домой
                </button>
                <button
                  className={deliveryType === "pickup" ? "is-active" : ""}
                  type="button"
                  onClick={() => setDeliveryType("pickup")}
                >
                  Пункт выдачи
                </button>
              </div>

              <div className="checkout-delivery-grid">
                <div className={`delivery-panel ${isPickup ? "is-muted" : ""}`}>
                  <h2>Адрес</h2>
                  <div className="profile-form-grid">
                    <label>
                      Страна
                      <input
                        className="form-input"
                        disabled={isPickup}
                        value={checkoutInfo.country}
                        onChange={(event) =>
                          updateCheckoutField("country", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Город
                      <input
                        className="form-input"
                        disabled={isPickup}
                        value={checkoutInfo.city}
                        onChange={(event) =>
                          updateCheckoutField("city", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Улица
                      <input
                        className="form-input"
                        disabled={isPickup}
                        value={checkoutInfo.street}
                        onChange={(event) =>
                          updateCheckoutField("street", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Дом
                      <input
                        className="form-input"
                        disabled={isPickup}
                        value={checkoutInfo.house}
                        onChange={(event) =>
                          updateCheckoutField("house", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Квартира
                      <input
                        className="form-input"
                        disabled={isPickup}
                        value={checkoutInfo.apartment}
                        onChange={(event) =>
                          updateCheckoutField("apartment", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className={`delivery-panel ${!isPickup ? "is-muted" : ""}`}>
                  <h2 >Пункт выдачи</h2>
                  <label>
                    Адрес пункта выдачи
                    <select 
                      
                      className="select-input"
                      disabled={!isPickup}
                      value={checkoutInfo.pickupPoint}
                      onChange={(event) =>
                        updateCheckoutField("pickupPoint", event.target.value)
                      }
                    >
                      {PICKUP_POINTS.map((point) => (
                        <option key={point} value={point}>
                          {point}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="page-subtitle">Срок хранения заказа: 14 дней.</p>
                </div>
              </div>
            </section>

            {!user && (
              <p className="page-subtitle">Для оформления заказа нужно войти.</p>
            )}
            <button className="btn btn-success" onClick={handleCheckout}>
              Оформить заказ!
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default CheckoutPage;
