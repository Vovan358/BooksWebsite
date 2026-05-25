import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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

  const addToCart = useCallback((book, amount = 1) => {
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
  }, []);

  const removeFromCart = useCallback((bookId) => {
    setItems((prev) => prev.filter((item) => item.bookId !== bookId));
  }, []);

  const increase = useCallback((bookOrItem) => {
    const bookId = bookOrItem.bookId ?? bookOrItem.id;

    setItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decrease = useCallback((bookId) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.bookId === bookId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const syncWithBooks = useCallback((books, onChanged) => {
    let wasChanged = false;

    setItems((prev) => {
      let changed = false;
      const next = prev
        .map((item) => {
          const book = books.find((candidate) => candidate.id === item.bookId);

          if (!book || !book.available || book.stock < 1) {
            changed = true;
            return null;
          }

          const quantity = Math.min(item.quantity, book.stock);
          const updated = {
            ...item,
            title: book.title,
            author: book.author,
            price: book.price,
            stock: book.stock,
            image: book.image || `https://localhost:7149${book.imageUrl}`,
            quantity,
          };

          if (
            updated.title !== item.title ||
            updated.author !== item.author ||
            updated.price !== item.price ||
            updated.stock !== item.stock ||
            updated.image !== item.image ||
            updated.quantity !== item.quantity
          ) {
            changed = true;
          }

          return updated;
        })
        .filter(Boolean);

      wasChanged = changed;

      return next;
    });

    setTimeout(() => {
      if (wasChanged) onChanged?.();
    }, 0);
  }, []);

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
      syncWithBooks,
      totalCount,
      totalPrice,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      increase,
      decrease,
      clearCart,
      syncWithBooks,
      totalCount,
      totalPrice,
    ]
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
