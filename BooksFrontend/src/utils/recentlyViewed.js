const RECENTLY_VIEWED_KEY = "booksWebsiteRecentlyViewed";

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(book) {
  if (!book?.id) return;

  const current = getRecentlyViewed();
  const next = [book, ...current.filter((item) => item.id !== book.id)].slice(0, 10);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("recently-viewed:changed"));
}
