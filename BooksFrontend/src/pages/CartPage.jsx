import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const { items, increase, decrease, removeFromCart, clearCart, totalPrice } =
    useCart();

  return (
    <main style={{ padding: "20px" }}>
      <h1>Корзина</h1>

      {items.length === 0 ? (
        <p>Корзина пуста.</p>
      ) : (
        <>
          {items.map((item, index) => (
            <div key={item.bookId} style={{ marginBottom: "12px" }}>
              <strong>
                {index + 1}. {item.title}
              </strong>
              <p>
                {item.price} x {item.quantity} ={" "}
                {item.price * item.quantity}
              </p>
              <button onClick={() => decrease(item.bookId)}>-</button>
              <button onClick={() => increase(item)}>+</button>
              <button onClick={() => removeFromCart(item.bookId)}>
                Удалить
              </button>
            </div>
          ))}

          <h2>Total: {totalPrice}</h2>
          <button onClick={clearCart}>Очистить</button>
          <Link to="/checkout">Proceed</Link>
        </>
      )}
    </main>
  );
}

export default CartPage;
