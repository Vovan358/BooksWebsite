function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <button
        className="btn btn-ghost"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Назад
      </button>
      <span className="muted">
        {page} / {totalPages}
      </span>
      <button
        className="btn btn-ghost"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Вперёд
      </button>
    </div>
  );
}

export default Pagination;
