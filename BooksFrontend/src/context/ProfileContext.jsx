import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMyProfile, updateMyProfile } from "../api/api";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      setError("");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message || "Не удалось загрузить профиль");
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile, user]);

  const saveProfile = useCallback(async (nextProfile) => {
    setLoading(true);
    setError("");

    try {
      const saved = await updateMyProfile(nextProfile);
      setProfile(saved);
      return saved;
    } catch (err) {
      setError(err.message || "Не удалось сохранить профиль");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAdmin = profile?.role === "Admin";

  const value = useMemo(
    () => ({
      profile,
      loading,
      error,
      isAdmin,
      refreshProfile,
      saveProfile,
    }),
    [profile, loading, error, isAdmin, refreshProfile, saveProfile]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }

  return context;
}
