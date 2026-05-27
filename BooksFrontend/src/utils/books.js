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

export function getRatingClass(rating) {
  const value = Number(rating) || 0;

  if (value < 3) return "rating-low";
  if (value < 5) return "rating-orange";
  if (value < 7) return "rating-yellow";
  if (value < 8) return "rating-green";
  if (value < 9) return "rating-dark-green";
  return "rating-blue";
}

export function getBookBadge(book, books) {
  const maxSold = Math.max(...books.map((item) => item.soldCount || 0), 0);
  const reviewCandidates = books.filter((item) => (item.commentsNumber || 0) > 0);
  const maxRating = Math.max(
    ...reviewCandidates.map((item) => item.averageRating || 0),
    0
  );

  if (maxSold > 0 && (book.soldCount || 0) === maxSold) {
    return "ЛИДЕР ПРОДАЖ";
  }

  if (
    maxRating > 0 &&
    (book.commentsNumber || 0) > 0 &&
    (book.averageRating || 0) === maxRating
  ) {
    return "ЛУЧШИЕ ОТЗЫВЫ";
  }

  return "";
}

export function sortBooks(books, sortBy, direction = "asc") {
  const sorted = [...books];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "cost":
        return a.price - b.price;
      case "stock":
        return a.stock - b.stock;
      case "commentsNumber":
        return (a.commentsNumber || 0) - (b.commentsNumber || 0);
      case "averageRating":
        return (a.averageRating || 0) - (b.averageRating || 0);
      case "soldCount":
        return (a.soldCount || 0) - (b.soldCount || 0);
      case "favoritesCount":
        return (a.favoritesCount || 0) - (b.favoritesCount || 0);
      case "createdAt":
        return (
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0) ||
          a.id - b.id
        );
      case "author":
        return a.author.localeCompare(b.author);
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return a.id - b.id;
    }
  });

  if (direction === "desc") {
    sorted.reverse();
  }

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
