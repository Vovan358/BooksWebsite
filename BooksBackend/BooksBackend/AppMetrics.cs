using Prometheus;

public static class AppMetrics
{
    public static readonly Counter BooksRequestsCounter =
        Metrics.CreateCounter("books_requests_total", "Total number of GET /books requests");

    public static readonly Counter OrdersCounter =
        Metrics.CreateCounter("orders_total", "Total number of orders placed");

    public static readonly Gauge BooksInStockGauge =
        Metrics.CreateGauge("books_stock_total", "Current total stock of all books");

    public static readonly Histogram GetBooksDuration =
        Metrics.CreateHistogram(
            "get_books_duration_seconds",
            "Time spent fetching books");
}
