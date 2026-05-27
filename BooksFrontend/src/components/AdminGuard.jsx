import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

function AdminGuard() {
  const location = useLocation();
  const { token } = useAuth();
  const { profile, loading, error, isAdmin } = useProfile();
  const storedToken = token || localStorage.getItem("token");

  if (!storedToken) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (loading || (!profile && !error)) {
    return (
      <main className="page-shell">
        <div className="empty-state">Проверяем права администратора...</div>
      </main>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminGuard;
