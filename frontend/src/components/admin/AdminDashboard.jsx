import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, DollarSign, Package, Plus, RefreshCw, Search, ShoppingBag, Users } from "lucide-react";
import { apiBaseUrl } from "../../lib/config";
import { authFetch } from "../../utils/auth";
import { OrderStatus } from "../orders/order-status";
import AdminShell, { AdminEmpty, AdminLoading, AdminNotice, AdminPanel, date, money } from "./AdminShell";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
export default function AdminDashboard() {
  const [params, setParams] = useSearchParams();
  const section = ["orders", "customers"].includes(params.get("section")) ? params.get("section") : "overview";
  const query = params.get("q") || "";
  const filter = params.get("status") || "all";
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async () => {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError(""); setMessage("");
    try {
      const responses = await Promise.all([authFetch(`${apiBaseUrl}/api/admin/overview/`), authFetch(`${apiBaseUrl}/api/admin/customers/`)]);
      if (responses.some(response => !response.ok)) throw new Error("We couldn't load your workspace. Please try refreshing.");
      const [overview, people] = await Promise.all(responses.map(response => response.json()));
      setData(overview); setCustomers(people);
    } catch (err) { setError(err.message || "Connection interrupted. Please try again."); }
    finally { setLoading(false); lock.current = false; }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const mutate = async (path, payload, onSuccess, confirmation) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const response = await authFetch(`${apiBaseUrl}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("The change could not be saved. Please try again.");
      onSuccess(await response.json()); setMessage(confirmation);
    } catch (err) { setError(err.message || "Connection interrupted. Your change was not confirmed."); }
    finally { lock.current = false; setBusy(false); }
  };
  const updateOrder = (order, status) => mutate(`/api/admin/orders/${order.id}/`, { status }, updated => setData(old => ({ ...old, stats: { ...old.stats, pendingOrders: Number(old.stats.pendingOrders || 0) + Number(updated.status === "pending") - Number(order.status === "pending") }, orders: old.orders.map(item => item.id === updated.id ? updated : item) })), `Order #${order.id} updated.`);
  const toggleCustomer = customer => {
    if (customer.is_active && !window.confirm(`Suspend access for ${customer.username}? You can restore access later.`)) return;
    void mutate(`/api/admin/customers/${customer.id}/`, { is_active: !customer.is_active }, updated => setCustomers(old => old.map(item => item.id === updated.id ? updated : item)), `Customer access ${customer.is_active ? "suspended" : "restored"}.`);
  };
  const changeFilter = (key, value) => setParams(old => { const next = new URLSearchParams(old); if (value && value !== "all") next.set(key, value); else next.delete(key); return next; }, { replace: true });
  const orders = useMemo(() => (data?.orders || []).filter(order => `#${order.id} ${order.customer?.name || ""} ${order.customer?.email || ""}`.toLowerCase().includes(query.toLowerCase().trim()) && (filter === "all" || order.status === filter)), [data, query, filter]);
  const people = useMemo(() => customers.filter(person => `${person.first_name} ${person.last_name} ${person.username} ${person.email}`.toLowerCase().includes(query.toLowerCase().trim()) && (filter === "all" || (filter === "active" ? person.is_active : !person.is_active))), [customers, query, filter]);
  const stats = data?.stats || {};
  const cards = [["Order value", money(stats.totalRevenue), "All recorded orders", DollarSign], ["Orders", stats.totalOrders || 0, "Across all statuses", ShoppingBag], ["Products", stats.totalProducts || 0, "In your live catalog", Package], ["Customers", stats.totalCustomers || 0, "Registered accounts", Users]];
  return <AdminShell title={section === "overview" ? "A good day to grow." : section === "orders" ? "Orders" : "Your customers"} description={section === "overview" ? "A clear view of your store, and what needs your attention." : section === "orders" ? "Follow every order from placement to delivery." : "Manage the people and accounts behind your store."} actions={<><button className="admin-icon-button" onClick={() => void load()} disabled={loading || busy} aria-label="Refresh workspace"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button><Link className="admin-button admin-button-primary" to="/admin/products?new=1"><Plus size={16} />Add product</Link></>}>
    {process.env.NEXT_PUBLIC_CATALOG_MODE === "demo" && <div className="admin-notice">The storefront displays a sample clothing collection. This workspace manages live inventory; changes appear when live catalog mode is enabled.</div>}
    <AdminNotice error={error} message={message} />
    {loading ? <AdminLoading /> : !data ? <AdminEmpty title="Your workspace is unavailable">Use refresh to reconnect to your store.</AdminEmpty> : section === "overview" ? <>
      <div className="admin-metrics">{cards.map(([label, value, caption, Icon]) => <article key={label} className="admin-metric"><div className="admin-metric-top"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small>{caption}</small></article>)}</div>
      <div className="admin-overview-grid"><AdminPanel title="Latest orders" description="The most recent activity in your store" action={<Link className="admin-text-link" to="/admin?section=orders">View all <ArrowUpRight size={14} /></Link>}>
        {data.orders.length ? data.orders.slice(0, 5).map(order => <div key={order.id} className="admin-recent-order"><div><p>#{order.id} · {order.customer?.name || "Guest"}</p><small>{date(order.created_at)} · {order.items?.length || 0} line items</small></div><div><p>{money(order.total_amount)}</p><span className={`admin-badge admin-badge-${order.status}`}>{order.status}</span></div></div>) : <AdminEmpty title="Your first order starts here">New orders will appear here as they arrive.</AdminEmpty>}
      </AdminPanel><AdminPanel title="Needs your attention" description="A few things to keep moving"><div className="admin-attention"><Link to="/admin?section=orders&status=pending"><span>Orders awaiting processing</span><strong>{stats.pendingOrders || 0}</strong><ArrowUpRight size={17} /></Link><Link to="/admin/products?stock=low"><span>Products with low stock</span><strong>{stats.lowStock || 0}</strong><ArrowUpRight size={17} /></Link></div><p className="admin-panel-note">Low stock includes products with five or fewer units. Check availability before fulfilling an order.</p></AdminPanel></div>
    </> : <>
      <div className="admin-toolbar"><label className="admin-field admin-search"><span>Search {section}</span><Search size={16} /><input value={query} onChange={event => changeFilter("q", event.target.value)} placeholder={section === "orders" ? "Order number, name or email" : "Name, username or email"} /></label><label className="admin-field"><span>Status</span><select value={filter} onChange={event => changeFilter("status", event.target.value)}><option value="all">All statuses</option>{(section === "orders" ? statuses : ["active", "suspended"]).map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label></div>
      <AdminPanel title={`${section === "orders" ? "Orders" : "Customers"} (${section === "orders" ? orders.length : people.length})`} description="Live store records">
        {!(section === "orders" ? orders.length : people.length) ? <AdminEmpty title="No matches found">Try another search or choose all statuses.</AdminEmpty> : <div className="admin-table-scroll" tabIndex={0} role="region" aria-label={`${section} table`}><table className="admin-table"><thead><tr>{(section === "orders" ? ["Order", "Customer", "Date", "Total", "Status"] : ["Customer", "Joined", "Orders", "Order value", "Status", "Access"]).map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
          {section === "orders" ? orders.map(order => <tr key={order.id}><td><strong>#{order.id}</strong><small>{order.items?.length || 0} line items</small></td><td>{order.customer?.name || "Guest"}<small>{order.customer?.email}</small><details className="mt-2 max-w-xs"><summary className="cursor-pointer py-2 text-xs text-primary">Order & delivery details</summary><OrderStatus status={order.status} /><div className="space-y-2 py-2 text-xs"><p>{order.name || order.customer?.name}</p><p className="whitespace-pre-line">{order.address || "No address recorded"}</p><p>{order.phone}</p><p>{order.payment_method === "COD" ? "Cash on delivery" : order.payment_method}</p>{order.items?.map(item => <p key={item.id}>{item.quantity} × {item.product?.name || item.product_name || "Deleted product"}</p>)}</div></details></td><td>{date(order.created_at)}</td><td>{money(order.total_amount)}</td><td><select className="admin-select" aria-label={`Status of order ${order.id}`} disabled={busy} value={order.status} onChange={event => void updateOrder(order, event.target.value)}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></td></tr>) : people.map(person => <tr key={person.id}><td><strong>{`${person.first_name || ""} ${person.last_name || ""}`.trim() || person.username}</strong><small>{person.email || person.username}</small></td><td>{date(person.date_joined)}</td><td>{person.order_count}</td><td>{money(person.total_spent)}</td><td><span className={`admin-badge ${person.is_active ? "" : "admin-badge-out"}`}>{person.is_active ? "Active" : "Suspended"}</span></td><td><button disabled={busy} className={`admin-button ${person.is_active ? "admin-button-danger" : ""}`} onClick={() => toggleCustomer(person)} aria-label={`${person.is_active ? "Suspend" : "Restore"} ${person.username}`}>{person.is_active ? "Suspend" : "Restore"}</button></td></tr>)}
        </tbody></table></div>}
      </AdminPanel>
    </>}
  </AdminShell>;
}
