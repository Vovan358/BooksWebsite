import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicUserProfile } from "../api/api";

function UserPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPublicUserProfile(id);
      setProfile(data);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="empty-state">Загрузка профиля...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page-shell">
        <div className="empty-state">Пользователь не найден.</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="panel user-profile-card">
        <div className="user-avatar-preview">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.username} />
          ) : (
            <span>{profile.username?.slice(0, 1)?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <h1>{profile.username}</h1>
          <p className="page-subtitle">
            {profile.description || "Пользователь пока не добавил описание."}
          </p>
        </div>
      </section>
    </main>
  );
}

export default UserPage;
