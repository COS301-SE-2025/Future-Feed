//ustom hook to hek users in the eplore page
//hook makes it easily re-usable
// src/hooks/useAuthCheck.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function useAuthCheck() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/myInfo`, {
          credentials: "include",
        });
        if (!res.ok) {
          // if unauthorized, redirect
          if (res.status === 401 || res.status === 403) {
            navigate("/login");
            setIsAuthenticated(false);
            return;
          }
          throw new Error(`Auth check failed with status ${res.status}`);
        }
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth check error:", err);
        navigate("/login");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return isAuthenticated;
}
