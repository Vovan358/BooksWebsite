import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/api";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const labels = {
  booksBought: "Количество купленных книг",
  moneySpent: "Количество потраченных денег",
  commentsLeft: "Количество оставленных комментариев",
};

function LeaderboardPage() {
  const { user, openAuth } = useAuth();
  const [sortBy, setSortBy] = useState("booksBought");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await getLeaderboard(sortBy, page, PAGE_SIZE);
      setData(result);
    };

    load();
  }, [sortBy, page]);

  const totalPages = Math.max(1, Math.ceil((data?.totalUsers || 0) / PAGE_SIZE));
  const valueKey =
    sortBy === "moneySpent"
      ? "moneySpent"
      : sortBy === "commentsLeft"
      ? "commentsLeft"
      : "booksBought";

  return (
    <main className="page-shell split-layout">
      <aside className="panel">
        <h2>{user || "Гость"}</h2>
        {data?.currentUserRanks ? (
          <div className="stat-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="stat-tile">
              <span className="stat-value">#{data.currentUserRanks.booksBoughtRank}</span>
              <span className="stat-label">Место по купленным книгам</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">#{data.currentUserRanks.moneySpentRank}</span>
              <span className="stat-label">Место по потраченным деньгам</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">#{data.currentUserRanks.commentsLeftRank}</span>
              <span className="stat-label">Место по оставленным отзывам</span>
            </div>
          </div>
        ) : (
          <div className="inline-auth-prompt">
            <button className="btn btn-success" onClick={openAuth}>
              Войдите
            </button>
            <span>чтобы увидеть свои места.</span>
          </div>
        )}
      </aside>

      <section>
        <div className="page-title-row">
          <div>
            <h1>Покупатели</h1>
            <p className="page-subtitle">Рейтинг пользователей маркетплейса.</p>
          </div>
          <select
            className="select-input"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="booksBought">Книги</option>
            <option value="moneySpent">Деньги</option>
            <option value="commentsLeft">Отзывы</option>
          </select>
        </div>

        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Покупатель</th>
                <th>{labels[sortBy]}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows || []).map((row) => (
                <tr key={row.userId}>
                  <td>{row.rank}</td>
                  <td>{row.username}</td>
                  <td>
                    {row[valueKey]}
                    {sortBy === "moneySpent" ? " ₽" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>
    </main>
  );
}

export default LeaderboardPage;
