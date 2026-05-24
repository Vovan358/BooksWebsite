import { useState, useEffect, useRef } from "react";

function BookItem({ book, onAddToCart, onClick, isSelected, cartItemCount = 0 }) {
  const [clicked, setClicked] = useState(false);
  const [animate, setAnimate] = useState(false);
  const timeoutRef = useRef(null);

  const isDisabled = !book.available || cartItemCount >= book.stock;

  // 👇 Анимация при изменении stock (после заказа)
  useEffect(() => {
    setAnimate(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAnimate(false);
      timeoutRef.current = null;
    }, 400);
  }, [book.stock]);

  return (
    <div
      onClick={onClick}
      style={{
        border: isSelected ? "2px solid #007bff" : "1px solid #ccc",
        padding: "0",
        borderRadius: "8px",
        marginBottom: "12px",
        display: "flex",
        alignItems: "stretch",
        gap: "0",
        background: "#262431",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Картинка на всю высоту карточки */}
      <div style={{
        width: "120px",
        flexShrink: 0,
        position: "relative",
        background: "#e0e0e0",
      }}>
        <img 
          src={`https://localhost:7149${book.imageUrl}`} 
          alt={book.title}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "150px",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/120x150?text=No+Image";
          }}
        />
      </div>
      
      {/* Контент с выравниванием слева */}
      <div style={{ 
        flex: 1, 
        textAlign: "left",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div>
          <h4 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{book.title}</h4>
          <p style={{ margin: "0 0 5px 0", color: "#999898", fontSize: "14px" }}>{book.author}</p>
          <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#2e7d32" }}>
            {book.price} ₽
          </p>

          {/* 👇 Показываем РЕАЛЬНЫЙ stock (без вычитания корзины) */}
          <p
            style={{
              fontWeight: "bold",
              color: animate ? "#ffeb3b" : "#ffffff",
              transform: animate ? "scale(1.2)" : "scale(1)",
              transition: "transform 0.3s, color 0.3s",
              fontSize: "13px",
              margin: "0 0 10px 0",
              display: "inline-block",
            }}
          >
            В наличии: {book.stock} шт.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isDisabled) return;
              onAddToCart(book);
              setClicked(true);
              setTimeout(() => setClicked(false), 500);
            }}
            style={{
              background: isDisabled ? "#a8130e" : "#ffa726",
              color: isDisabled ? "rgb(242, 242, 242)" : "#212121ff",
              border: "none",
              borderRadius: "5px",
              padding: "6px 14px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              transition: "transform 0.15s, background 0.2s",
              transform: clicked ? "scale(1.05)" : "scale(1)",
              boxShadow: clicked ? "0 3px 6px rgba(0,0,0,0.2)" : "none",
            }}
            disabled={isDisabled}
          >
            {isDisabled ? "Нет в наличии" : "В корзину"}
          </button>

          {clicked && (
            <span style={{ color: "#43a047", fontWeight: "bold", fontSize: "13px" }}>
              ✓ Добавлено!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookItem; 