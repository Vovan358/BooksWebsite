import BookItem from "./BookItem";

function BookList({ books, onSelectBook, selectedBook, onAddToCart,cartItems }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {books.map(book => (
        <div key={book.id} style={{ width: "calc(50% - 10px)" }}>
          <BookItem
            book={book}
            onClick={() => onSelectBook(book)}
            onSelect={onSelectBook}
            isSelected={selectedBook && selectedBook?.id === book.id}
            onAddToCart={onAddToCart}
            cartItemCount={cartItems.find(i => i.bookId === book.id)?.quantity || 0}
          />
        </div>
      ))}
    </div>
  );
}

export default BookList;