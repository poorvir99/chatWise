import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (user && location.pathname !== "/chat") {
      navigate("/chat", { replace: true });
    } else if (!user && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, location]);

  return children;
};

export default AuthRedirect;
