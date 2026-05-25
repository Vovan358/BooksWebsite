import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate("/auth", { replace: true });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [navigate]);

  return null;
}

export default AuthRedirectHandler;
