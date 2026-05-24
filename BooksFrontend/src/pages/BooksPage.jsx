import { useEffect, useState } from "react";
import BookList from "../components/BookList";
import CommentsSection from "../components/CommentsSection";
import Cart from "../components/Cart";
import { getBooks, placeOrder } from "../api/api";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  //15
  const [cookieUsername, setCookieUsername] = useState("");
  const [sessionUsername, setSessionUsername] = useState("");
  const [storedBookTitle, setStoredBookTitle] = useState(
    sessionStorage.getItem("selectedBook") || ""
  );
  //15
  const [orderSuccess, setOrderSuccess] = useState(false); // 👈 Для уведомления о заказе
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout, openAuth, isAuthOpen, closeAuth } = useAuth();
  const {
    items: cartItems,
    addToCart: addCartItem,
    increase,
    decrease,
    clearCart,
    totalCount,
    totalPrice,
  } = useCart();
  
  
  //15
  const [lastViewedBook, setLastViewedBook] = useState(
    sessionStorage.getItem("lastBook") || null
  );

  const [selectedBook, setSelectedBook] = useState(null);
  //15

  const handlePlaceOrder = async (items) => {
    await placeOrder(items);

    const updatedBooks = await getBooks();
    setBooks(updatedBooks);
  };
  const fetchData = async () => {
    const data = await getBooks();
    console.log("API books:", data);
    setBooks(data);
    setLoading(false);
  };

  const handleMouseEnter = (e) => e.currentTarget.style.transform = "scale(1.05)";
  const handleMouseLeave = (e) => e.currentTarget.style.transform = "scale(1)";
    
  //15
  const resetStorageDemo = () => {
    setCookieUsername("");
    setSessionUsername("");
  };

  const saveCookie = async () => {
    if (!user) return;

    await fetch("https://localhost:7149/api/auth/cookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    });
  };

  const saveSession = async () => {
    if (!user) return;

    await fetch("https://localhost:7149/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    });
  };

  const getCookie = async () => {
    const res = await fetch("https://localhost:7149/api/auth/cookie", {
      credentials: "include",
    });

    const data = await res.json();

    setCookieUsername(data.username || "");
  };

  const getSession = async () => {
    const res = await fetch("https://localhost:7149/api/auth/session", {
      credentials: "include",
    });

    const data = await res.json();

    setSessionUsername(data.username || "");
  };

  useEffect(() => {
    if (selectedBook) {
      sessionStorage.setItem("selectedBook", selectedBook.title);

      setStoredBookTitle(selectedBook.title);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (!user) {
      setCookieUsername("");
      setSessionUsername("");
    }
  }, [user]);
  
  const saveToSession = async () => {
    await fetch("https://localhost:7149/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  };
  // 15 

  // 16

  const testUser = async () => {
    const data = await apiFetch("https://localhost:7149/api/secure/user");
    console.log("USER:", data);
  };

  const testAdmin = async () => {
    const data = await apiFetch("https://localhost:7149/api/secure/admin");
    console.log("ADMIN:", data);
  };
  const apiFetch = async (url) => {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return await res.text();
  };
  // 16

  // Добавить книгу в корзину
  const addToCart = (book) => {
    addCartItem(book);
  };

  const increaseCartItem = (item) => {
    increase(item);
  };

  const removeFromCart = (bookId) => {
    decrease(bookId);
  };
  useEffect(() => {
    const fetchData = async () => {
      const data = await getBooks();
      setBooks(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const syncStorage = async () => {
      if (!user) return;

      await saveCookie();
      await saveSession();

      await getCookie();
      await getSession();
    };

    syncStorage();
  }, [user]);

  // 👇 Оформление заказа с уменьшением stock
  const placeOrderHandler = async () => {
    const ids = cartItems.flatMap(item =>
      Array(item.quantity).fill(item.bookId)
    );

    await placeOrder(ids);

    const updatedBooks = await getBooks();
    setBooks(updatedBooks);

    setOrderSuccess(true);

    setTimeout(() => {
      clearCart();
      setOrderSuccess(false);
      setCartOpen(false);
    }, 3000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Каталог книг</h1>

      {/* 👇 ИСПРАВЛЕНО: books.length (строчная L) */}
      <p style={{ color: "#d9d9d9", marginBottom: "20px" }}>
        Найдено книг: {books.length}
      </p>

      {/* Состояния */}
      {loading ? (
        <div style={{ fontSize: "20px", marginTop: "20px" }}>
          ⏳ Загрузка книг с сервера...
        </div>
      ) : books.length === 0 ? (
        <p>📭 Нет книг</p>
      ) : (
        <BookList
          books={books}
          onSelectBook={setSelectedBook}
          selectedBook={selectedBook}
          onAddToCart={addToCart}
          cartItems={cartItems}
        />
      )}

      <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 300,
        marginTop:"40px",
         }}>
        {!user ? (
          <button style={{background: "#43a047",
        color: "white"}}
        onClick={openAuth}>
            Войти в аккаунт
          </button>
        ) : (
          <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
        padding: "8px 10px",
        background: "#262431",
        borderRadius: "8px",
        color: "#fff",
      }}
    >
      <span style={{ fontSize: "14px" }}>👤 {user}</span>

      <button
        onClick={logout}
        style={{
          background: "#ff0800",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "6px 10px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Выйти из аккаунта
      </button>
    </div>
        )}
      </div>

      <button
        onClick={() => setCartOpen(prev => !prev)}
        style={{ 
          position: "fixed", 
          top: "20px", 
          left: "20px", 
          zIndex: 200,
          background: "#fcaa2f",
          color: "#212121ff"
         }}
         
        onMouseEnter={e => e.currentTarget.style.background = "#ff9800"}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#fcaa2f";
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
        🛒 Корзина ({totalCount})
      </button>

      {/* Уведомление об успешном заказе */}
      {orderSuccess && (
        <div style={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#43a047",
          color: "white",
          padding: "15px 30px",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "16px",
          zIndex: 300,
          boxShadow: "0 4px 12px rgba(67, 160, 71, 0.5)",
          animation: "fadeIn 0.3s",
        }}>
          ✅ Заказ оформлен!
        </div>
      )}

      {/* Комментарии */}
      {selectedBook && (
        <CommentsSection book={selectedBook} />
      )}

      {/* 👇 Передаём placeOrder в Cart */}
      <Cart
        items={cartItems}
        onAdd={increaseCartItem}
        onRemove={removeFromCart}
        onClear={clearCart}
        onPlaceOrder={handlePlaceOrder}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
      />
      <div style={{ marginTop: "40px", padding: "10px", background: "#222", color: "white" }}>
        <h3>Storage Demo</h3>

        <p>Cookie username: {cookieUsername}</p>
        <p>Session username: {sessionUsername}</p>
        <p>localStorage username: {localStorage.getItem("username")}</p>
        <p>sessionStorage selectedBook: {storedBookTitle}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={testUser}>Test USER endpoint</button>
        <button onClick={testAdmin}>Test ADMIN endpoint</button>
      </div>
    </div>

    
  );
}

export default BooksPage;
