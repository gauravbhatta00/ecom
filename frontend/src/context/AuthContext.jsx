import { apiBaseUrl } from '../lib/config';
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { saveTokens, clearTokens, getAccessToken, authFetch } from "../utils/auth";

const AuthContext = createContext();
const BASEURL = apiBaseUrl;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setSessionLoading(false);
    setError(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authFetch(`${BASEURL}/api/auth/me/`); // ✅ fixed URL
      if (!res.ok) { logout(); return null; }
      const data = await res.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error("fetchProfile error:", err);
      logout();
      return null;
    } finally {
      setSessionLoading(false);
    }
  }, [logout]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASEURL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid credentials");
        return false;
      }

      saveTokens(data);
      if (!await fetchProfile()) { setError("We couldn't load your account. Please try again."); return false; }
      setIsAuthenticated(true);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASEURL}/api/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid admin credentials");
        return false;
      }
      saveTokens({ access: data.access, refresh: data.refresh });
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Admin login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setError("Not authenticated");
        return false;
      }

      const res = await fetch(`${BASEURL}/api/auth/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Profile parse error:", parseError);
        data = null;
      }
      if (!res.ok) {
        if (typeof data === "object" && data !== null) {
          const fieldErrors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" ");
          setError(fieldErrors || `Profile update failed (${res.status})`);
        } else {
          setError(data?.detail || `Profile update failed (${res.status})`);
        }
        return false;
      }

      if (!data) {
        setError("Profile update failed: unexpected server response.");
        return false;
      }

      setUser(data);
      return true;
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Profile update failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASEURL}/api/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || "Google login failed.");
        return false;
      }

      saveTokens({ access: data.access, refresh: data.refresh });
      if (!await fetchProfile()) { setError("We couldn't load your account. Please try again."); return false; }
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ username, email, password, password2 }) => {
    setLoading(true);
    setError(null);

    if (password !== password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return false;
    }

    try {
      const res = await fetch(`${BASEURL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, password2 }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (typeof data === "object" && data !== null) {
          const fieldErrors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" ");
          setError(fieldErrors || "Registration failed.");
        } else {
          setError(data.detail || "Registration failed.");
        }
        return false;
      }

      // Registration succeeded; do not auto-login.
      return true;
    } catch (err) {
      console.error("Register error:", err);
      setError("Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASEURL}/api/auth/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.email?.[0] || data.error || data.detail || "Something went wrong. Please try again.");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Password reset request error:", err);
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async ({ uid, token, newPassword, newPassword2 }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASEURL}/api/auth/password-reset-confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: newPassword, new_password2: newPassword2 }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (typeof data === "object" && data !== null) {
          const fieldErrors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" ");
          setError(fieldErrors || "Reset link is invalid or has expired.");
        } else {
          setError("Reset link is invalid or has expired.");
        }
        return false;
      }
      return true;
    } catch (err) {
      console.error("Password reset confirm error:", err);
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Start with the same state on the server and client, then restore browser credentials.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!getAccessToken()) { setSessionLoading(false); return; }
      const profile = await fetchProfile();
      if (active) setIsAuthenticated(Boolean(profile));
    };
    restore();
    return () => { active = false; };
  }, [fetchProfile]);
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, sessionLoading, loading, error, login, adminLogin, loginWithGoogle, logout, register, updateProfile, fetchProfile, requestPasswordReset, confirmPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context and its hook intentionally share this module.
export const useAuth = () => useContext(AuthContext);
