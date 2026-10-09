import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, FolderTree, LayoutDashboard, LogOut, Package, ShoppingBag, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sections = [
  ["overview", "Overview", "/admin", LayoutDashboard],
  ["products", "Products", "/admin/products", Package],
  ["categories", "Categories", "/admin/products?view=categories", FolderTree],
  ["orders", "Orders", "/admin?section=orders", ShoppingBag],
  ["customers", "Customers", "/admin?section=customers", Users],
];

export default function AdminShell({ title, description, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requested = new URLSearchParams(location.search).get("section");
  const active = location.pathname === "/admin/products" ? new URLSearchParams(location.search).get("view") === "categories" ? "categories" : "products" : ["orders", "customers"].includes(requested) ? requested : "overview";
  return <div className="admin-workspace">
    <aside className="admin-sidebar">
      <Link to="/admin" className="admin-brand">LeloVaiLelo<span>Store administration</span></Link>
      <p className="admin-nav-label">Workspace</p>
      <nav aria-label="Admin navigation" className="admin-nav">
        {sections.map(([id, label, to, Icon]) => <Link key={id} to={to} aria-current={active === id ? "page" : undefined}><Icon size={19} /><span>{label}</span></Link>)}
      </nav>
      <div className="admin-sidebar-bottom"><p>Your store, thoughtfully managed.</p><Link to="/">View storefront <ArrowUpRight size={16} /></Link></div>
    </aside>
    <div className="admin-body">
      <header className="admin-topbar"><span>Store workspace <span className="admin-badge">Admin</span></span><div className="admin-account"><span>{user?.first_name || user?.username || "Administrator"}</span><Link to="/" className="admin-icon-button" aria-label="View storefront"><ArrowUpRight size={18} /></Link><button className="admin-icon-button" aria-label="Sign out of admin" onClick={() => { logout(); navigate("/admin/login"); }}><LogOut size={18} /></button></div></header>
      <main className="admin-main"><header className="admin-page-heading"><div><p className="admin-eyebrow">LeloVaiLelo / {active}</p><h1>{title}</h1><p>{description}</p></div><div className="admin-actions">{actions}</div></header>{children}</main>
    </div>
  </div>;
}

export function AdminPanel({ title, description, action, children }) {
  return <section className="admin-panel"><div className="admin-panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>{children}</section>;
}

export function AdminNotice({ error, message }) {
  return <>{error && <div role="alert" className="admin-notice admin-notice-error">{error}</div>}{message && <div role="status" className="admin-notice">{message}</div>}</>;
}

export function AdminEmpty({ title = "Nothing here yet", children }) {
  return <div className="admin-empty"><Package size={28} aria-hidden="true" /><h3>{title}</h3><p>{children}</p></div>;
}

export function AdminLoading() {
  return <div role="status" className="admin-loading"><span className="admin-loading-line" /><span className="admin-loading-line" /><span className="admin-loading-line" /><p>Loading store data…</p></div>;
}

export function money(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0)); }
export function date(value) { return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"; }
