import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { adminLogin, isAuthenticated, user, loading, sessionLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const lock = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = ["/admin", "/admin/products"].includes(location.state?.from) ? location.state.from : "/admin";
  if (isAuthenticated && user?.role === "admin") return <Navigate to={destination} replace />;
  const submit = async event => {
    event.preventDefault(); if (lock.current) return;
    lock.current = true;
    try { if (await adminLogin(credentials)) navigate(destination, { replace: true }); }
    finally { lock.current = false; }
  };
  return <main className="admin-login"><section className="admin-login-story"><Link to="/" className="admin-brand">LeloVaiLelo<span>Store administration</span></Link><div><h2>Behind every<br /><em>well-dressed day.</em></h2><p>A thoughtful space to manage your collection, look after your customers, and keep your store moving.</p></div><small>Considered clothing. Considered management.</small></section><section className="admin-login-form"><div><p className="admin-eyebrow">Welcome back</p><h1>Your store awaits.</h1><p className="admin-dialog-description mt-4">Sign in with your administrator account to continue.</p><form onSubmit={submit}><label className="admin-field"><span>Username</span><input autoComplete="username" required value={credentials.username} onChange={event => setCredentials(old => ({ ...old, username: event.target.value }))} /></label><label className="admin-field"><span>Password</span><input type="password" autoComplete="current-password" required value={credentials.password} onChange={event => setCredentials(old => ({ ...old, password: event.target.value }))} /></label>{error && <p role="alert" className="admin-notice admin-notice-error">{error}</p>}<button className="admin-button admin-button-primary" disabled={loading || sessionLoading}>{loading ? "Signing in…" : "Sign in to workspace"}<ArrowRight size={17} /></button></form><Link to="/" className="admin-text-link mt-6">Return to the store <ArrowUpRight size={15} /></Link></div></section></main>;
}
