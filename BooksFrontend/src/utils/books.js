export const PAGE_SIZE = 6;

export function getImageUrl(book) {
  if (!book?.imageUrl) return "https://via.placeholder.com/240x320?text=No+Image";
  if (book.imageUrl.startsWith("http")) return book.imageUrl;
  return `https://localhost:7149${book.imageUrl}`;
}

export function filterBooks(books, search) {
  const query = search.trim().toLowerCase();
  if (!query) return books;

  return books.filter((book) =>
    [book.title, book.author].some((value) =>
      value?.toLowerCase().includes(query)
    )
  );
}

export function sortBooks(books, sortBy) {
  const sorted = [...books];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "cost":
        return a.price - b.price;
      case "stock":
        return b.stock - a.stock;
      case "commentsNumber":
        return (b.commentsNumber || 0) - (a.commentsNumber || 0);
      case "averageRating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      case "author":
        return a.author.localeCompare(b.author);
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return a.id - b.id;
    }
  });

  return sorted;
}

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}
