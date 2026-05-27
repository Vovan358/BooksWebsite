import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addFavorite, getFavorites, removeFavorite } from "../api/api";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { token, openAuth } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const favoriteIds = useMemo(
    () => new Set(favorites.map((book) => book.id)),
    [favorites]
  );

  const refreshFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      setError("");
      return [];
    }

    setLoading(true);
    setError("");

    try {
      const data = await getFavorites();
      setFavorites(data);
      return data;
    } catch (err) {
      setError(err.message || "Не удалось загрузить избранное");
      setFavorites([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (bookId) => favoriteIds.has(bookId),
    [favoriteIds]
  );

  const add = useCallback(
    async (book) => {
      if (!token) {
        openAuth();
        return;
      }

      const bookId = book.id ?? book.bookId;
      if (favoriteIds.has(bookId)) return;

      setFavorites((prev) => [...prev, { ...book, id: bookId }]);

      try {
        await addFavorite(bookId);
        await refreshFavorites();
      } catch (err) {
        setError(err.message || "Не удалось добавить в избранное");
        await refreshFavorites();
      }
    },
    [favoriteIds, openAuth, refreshFavorites, token]
  );

  const remove = useCallback(
    async (bookId) => {
      if (!token) {
        openAuth();
        return;
      }

      setFavorites((prev) => prev.filter((book) => book.id !== bookId));

      try {
        await removeFavorite(bookId);
      } catch (err) {
        setError(err.message || "Не удалось удалить из избранного");
        await refreshFavorites();
      }
    },
    [openAuth, refreshFavorites, token]
  );

  const toggle = useCallback(
    async (book) => {
      const bookId = book.id ?? book.bookId;

      if (favoriteIds.has(bookId)) {
        await remove(bookId);
      } else {
        await add(book);
      }
    },
    [add, favoriteIds, remove]
  );

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      loading,
      error,
      isFavorite,
      addFavorite: add,
      removeFavorite: remove,
      toggleFavorite: toggle,
      refreshFavorites,
    }),
    [
      favorites,
      favoriteIds,
      loading,
      error,
      isFavorite,
      add,
      remove,
      toggle,
      refreshFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
