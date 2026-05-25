import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const { items, increase, decrease, removeFromCart, clearCart, totalPrice } =
    useCart();

  return (
    <main className="page-shell">
      <div className="page-title-row">
        <div>
          <h1>Корзина</h1>
          <p className="page-subtitle">Проверьте товары перед оформлением.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">Корзина пуста.</div>
      ) : (
        <section className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>bookName</th>
                <th>stock</th>
                <th>amount</th>
                <th>subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.bookId}>
                  <td>{index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.stock}</td>
                  <td>
                    <div className="amount-control">
                      <button className="btn btn-ghost" onClick={() => decrease(item.bookId)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button className="btn btn-ghost" onClick={() => increase(item)}>
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.price * item.quantity} ₽</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeFromCart(item.bookId)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-title-row" style={{ marginTop: "18px" }}>
            <h2>Total: {totalPrice} ₽</h2>
            <div className="button-row">
              <button className="btn btn-danger" onClick={clearCart}>
                Очистить
              </button>
              <Link className="btn btn-success" to="/checkout">
                Proceed
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default CartPage;
