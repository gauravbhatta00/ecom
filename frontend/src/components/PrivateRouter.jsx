import {Navigate, Outlet, useLocation} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRouter({ redirectTo = "/login" }) {
    const location = useLocation();
    const { isAuthenticated, sessionLoading } = useAuth();
    if (sessionLoading) return <div role="status" className="page-shell py-20">Restoring your session…</div>;
    return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} state={{ from: location.pathname + location.search }} replace />;
}
