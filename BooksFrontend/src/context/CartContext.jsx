import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "booksWebsiteCart";

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toCartItem(book, quantity) {
  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    quantity,
    stock: book.stock,
    image: book.image || `https://localhost:7149${book.imageUrl}`,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (book, amount = 1) => {
    if (!book?.available || book.stock < 1 || amount < 1) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      const currentQuantity = existing?.quantity || 0;
      const nextQuantity = Math.min(currentQuantity + amount, book.stock);

      if (nextQuantity === currentQuantity) return prev;

      if (existing) {
        return prev.map((item) =>
          item.bookId === book.id
            ? {
                ...item,
                quantity: nextQuantity,
                stock: book.stock,
                price: book.price,
              }
            : item
        );
      }

      return [...prev, toCartItem(book, nextQuantity)];
    });
  };

  const removeFromCart = (bookId) => {
    setItems((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const increase = (bookOrItem) => {
    const bookId = bookOrItem.bookId ?? bookOrItem.id;

    setItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrease = (bookId) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.bookId === bookId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      increase,
      decrease,
      clearCart,
      totalCount,
      totalPrice,
    }),
    [items, totalCount, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
