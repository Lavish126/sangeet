import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "sangeet:user";

// The backend has no "who am I" endpoint, so the user returned at login is kept locally
function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const saveUser = useCallback((value) => {
    setUser(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable; the session still works for this tab
    }
  }, []);

  useEffect(() => {
    const onExpired = () => saveUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [saveUser]);

  const login = async (identifier, password) => {
    const credentials = identifier.includes("@")
      ? { email: identifier, password }
      : { userName: identifier, password };
    const data = await api.login(credentials);
    saveUser(data.user);
  };

  const register = async (fields) => {
    const data = await api.register(fields);
    saveUser(data.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      saveUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
