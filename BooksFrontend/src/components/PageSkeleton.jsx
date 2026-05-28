function PageSkeleton() {
  return (
    <div className="page-shell">
      <div className="skeleton-title" />
      <div className="skeleton-toolbar" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <div />
            <section>
              <span />
              <span />
              <span />
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageSkeleton;
