import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Cart({ items, onAdd, onRemove, onClear, onPlaceOrder, open, onClose }) {
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { user, openAuth } = useAuth();
  
  const placeOrderHandler = async () => {
    const payload = items.map(item => ({
      bookId: item.bookId,
      quantity: item.quantity
    }));

    await onPlaceOrder(payload); // 👍 родитель решает что делать

    setOrderSuccess(true);

    setTimeout(() => {
      onClear();
      setOrderSuccess(false);
      onClose();
    }, 3000);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`cart ${open ? "open" : ""}`} style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "500px",
        background: "#36334b", 
        color: "#ffffff",
        border: "1px solid #333",
        borderRadius: "12px",
        maxHeight: "600px",
        overflowY: "auto",
        transform: open ? "translateY(0)" : "translateY(-20px)",
        opacity: open ? 1 : 0,
        transition: "all 0.3s ease",
        padding: "15px",
        zIndex: 100,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ color: "#ffeb3b", margin: 0 }}>🛒 Корзина ({totalCount})</h3>
        <button 
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0 5px",
          }}
        >
          ✕
        </button>
      </div>
      
      {orderSuccess && (
        <div style={{
          background: "#43a047",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "16px",
          animation: "fadeIn 0.3s",
          boxShadow: "0 4px 12px rgba(67, 160, 71, 0.4)",
        }}>
          ✅ Заказ оформлен!
        </div>
      )}
      
      {items.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "30px" }}>
          📭 Корзина пуста
        </p>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {items.map(item => (
            <div 
              key={item.bookId} 
              style={{ 
                display: "flex", 
                alignItems: "flex-start",
                gap: "12px",
                borderBottom: "1px solid #444", 
                marginBottom: "12px", 
                paddingBottom: "12px" 
              }}
            >
              <img 
                src={item.image || "https://via.placeholder.com/60x80?text=No+Image"} 
                alt={item.title}
                style={{
                  width: "60px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  flexShrink: 0,
                  background: "#e0e0e0",
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/60x80?text=No+Image";
                }}
              />
              
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#ffeb3b", fontSize: "15px" }}>{item.title}</strong>
                <p style={{ margin: "3px 0", color: "#ccc", fontSize: "13px" }}>{item.author}</p>
                <p style={{ margin: "3px 0", fontSize: "14px", color: "#fff" }}>
                  {item.price} ₽ × {item.quantity}
                </p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  onClick={() => onRemove(item.bookId)}
                  style={{
                    background: "#e53935",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  −
                </button>
                <span style={{ color: "#fff", minWidth: "25px", textAlign: "center", fontSize: "15px" }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => onAdd(item)}
                  style={{
                    background: "#43a047",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div style={{ 
          borderTop: "2px solid #555", 
          paddingTop: "15px", 
          marginTop: "10px" 
        }}>
          <p style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: "#ffeb3b",
            margin: "0 0 15px 0",
            textAlign: "right"
          }}>
            Итого: {totalPrice} ₽
          </p>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClear}
              style={{
                flex: 1,
                background: "#a8130e",
                fontWeight: "bold",
                color: "rgb(242, 242, 242)",
                border: "none",
                borderRadius: "6px",
                padding: "10px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgb(255, 220, 220)696"}
              onMouseLeave={e => e.currentTarget.style.background = "#ff9696"}
            >
              Очистить
            </button>
            
            {user ? (<button
              onClick={placeOrderHandler}
              style={{
                flex: 2,
                background: "#43a047",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 15px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
                transition: "background 0.2s, transform 0.1s",
                boxShadow: "0 3px 8px rgba(67, 160, 71, 0.4)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#388e3c";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#43a047";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onMouseDown={e => e.currentTarget.style.transform = "translateY(1px)"}
            >
              🎉 Оформить заказ!
            </button>) : (
              <button
                type="button"
                onClick={openAuth}
                style={{
                  flex: 2,
                  background: "#43a047",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 15px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Войти, чтобы оформить заказ
              </button>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;