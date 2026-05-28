const RECENTLY_VIEWED_KEY = "booksWebsiteRecentlyViewed";

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return items.filter((book) => !book.isHidden);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(book) {
  if (!book?.id) return;
  if (book.isHidden) {
    removeRecentlyViewed(book.id);
    return;
  }

  const current = getRecentlyViewed();
  const next = [book, ...current.filter((item) => item.id !== book.id)].slice(0, 4);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("recently-viewed:changed"));
}

export function syncRecentlyViewed(visibleBooks) {
  const visibleIds = new Set(visibleBooks.map((book) => book.id));
  const next = getRecentlyViewed().filter((book) => visibleIds.has(book.id));
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("recently-viewed:changed"));
  return next;
}

export function removeRecentlyViewed(bookId) {
  const numericId = Number(bookId);
  const next = getRecentlyViewed().filter((item) => item.id !== numericId);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("recently-viewed:changed"));
}
