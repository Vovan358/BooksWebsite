import { Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <main className="page-shell auth-page">
        <section className="panel auth-page-panel">
          <div className="auth-form auth-form-page">
            <div>
              <h1>Вы уже вошли</h1>
              <p className="page-subtitle">
                Сейчас активен аккаунт {user}. Для входа под другим именем сначала выйдите.
              </p>
            </div>
            <Link className="btn btn-success" to="/">
              На главную
            </Link>
            <button className="btn btn-danger" type="button" onClick={logout}>
              Выйти из аккаунта
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell auth-page">
      <section className="panel auth-page-panel">
        <AuthForm variant="page" />
      </section>
    </main>
  );
}

export default AuthPage;
