// src/admin/AdminContext.jsx
// Handles admin authentication — completely separate from user auth
// Username: paygcontact1 | Password: 060706
// Access via: /x/admin (hidden route)

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminContext = createContext(null);

const ADMIN_USER = "paygcontact1";
const ADMIN_PASS = "060706";
const SESSION_KEY = "payg_admin_session";

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "authenticated") setIsAdmin(true);
    setLoading(false);
  }, []);

  function adminLogin(username, password) {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "authenticated");
      setIsAdmin(true);
      return true;
    }
    return false;
  }

  function adminLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, adminLogin, adminLogout, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

// Route guard — wraps protected admin pages
export function AdminGuard({ children }) {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/x/admin/login", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) return null;
  if (!isAdmin) return null;
  return children;
}
