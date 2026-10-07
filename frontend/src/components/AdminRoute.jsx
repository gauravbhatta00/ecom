import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { isAuthenticated, user, sessionLoading } = useAuth();
  const location = useLocation();

  if (sessionLoading) return <div role="status" className="page-shell py-20">Restoring your session…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (!user) return <div className="min-h-screen bg-[#f1f2ec] pt-32 text-center text-sm text-[#68716b]">Checking admin access…</div>;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
