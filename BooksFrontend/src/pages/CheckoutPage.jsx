import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CheckoutPage() {
  const { items, totalPrice } = useCart();

  return (
    <main style={{ padding: "20px" }}>
      <h1>Оформление заказа</h1>
      <Link to="/cart">Back to cart</Link>

      <section style={{ marginTop: "20px" }}>
        <h2>OrderInfo</h2>
        <p>Товаров: {items.length}</p>
        <p>Total: {totalPrice}</p>
      </section>
    </main>
  );
}

export default CheckoutPage;
