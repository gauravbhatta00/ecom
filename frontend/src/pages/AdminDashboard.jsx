import { apiBaseUrl } from '../lib/config';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, DollarSign, LayoutDashboard, Package, Plus, RefreshCw, Search, ShoppingBag, UserCheck, UserX, Users } from "lucide-react";
import { authFetch } from "../utils/auth";

const BASEURL = apiBaseUrl;
const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const badge = { pending: "bg-amber-100 text-amber-800", processing: "bg-blue-100 text-blue-800", shipped: "bg-violet-100 text-violet-800", delivered: "bg-emerald-100 text-emerald-800", cancelled: "bg-red-100 text-red-700" };

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ stats: {}, products: [], orders: [] });
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, customerRes] = await Promise.all([authFetch(`${BASEURL}/api/admin/overview/`), authFetch(`${BASEURL}/api/admin/customers/`)]);
      if (!overviewRes.ok || !customerRes.ok) throw new Error("Could not load the admin workspace");
      setData(await overviewRes.json()); setCustomers(await customerRes.json()); setError("");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateOrder = async (id, status) => {
    const res = await authFetch(`${BASEURL}/api/admin/orders/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) return setError("Order update failed");
    const updated = await res.json(); setData((old) => ({ ...old, orders: old.orders.map((order) => order.id === id ? updated : order) }));
  };
  const toggleCustomer = async (customer) => {
    const res = await authFetch(`${BASEURL}/api/admin/customers/${customer.id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !customer.is_active }) });
    if (!res.ok) return setError("Customer update failed");
    const updated = await res.json(); setCustomers((old) => old.map((item) => item.id === customer.id ? updated : item));
  };

  const products = useMemo(() => data.products.filter((p) => `${p.name} ${p.category?.name || ""}`.toLowerCase().includes(query.toLowerCase())), [data.products, query]);
  const orders = useMemo(() => data.orders.filter((o) => `#${o.id} ${o.customer?.name || ""} ${o.customer?.email || ""}`.toLowerCase().includes(query.toLowerCase())), [data.orders, query]);
  const filteredCustomers = useMemo(() => customers.filter((c) => `${c.first_name} ${c.last_name} ${c.username} ${c.email}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  const stats = data.stats;
  const statCards = [["Revenue", `$${Number(stats.totalRevenue || 0).toLocaleString()}`, <DollarSign key="DollarSign" size={20} />, "bg-[#dff274]"], ["Orders", stats.totalOrders || 0, <ShoppingBag key="ShoppingBag" size={20} />, "bg-blue-100"], ["Products", stats.totalProducts || 0, <Package key="Package" size={20} />, "bg-orange-100"], ["Customers", stats.totalCustomers || 0, <Users key="Users" size={20} />, "bg-violet-100"]];

  return <main className="min-h-screen bg-[#f1f2ec] pb-16 pt-28">
    <div className="page-shell">
      <header className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#71813d]"><LayoutDashboard size={15} /> Store command center</p><h1 className="display-font mt-2 text-4xl text-[#18231c] sm:text-5xl">Admin workspace</h1><p className="mt-2 text-sm text-[#68716b]">Manage inventory, fulfil orders, and support customers.</p></div><div className="flex gap-2"><button onClick={load} className="grid h-11 w-11 place-items-center rounded-full border border-[#d5d8cd] bg-white" aria-label="Refresh"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button><Link to="/admin/products" className="inline-flex items-center gap-2 rounded-full bg-[#173c2b] px-5 py-3 text-sm font-bold text-white"><Plus size={17} /> Add product</Link></div></header>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-[#dcded4] bg-white p-1.5" aria-label="Admin sections">{[["overview", "Overview"], ["products", "Items"], ["orders", "Orders"], ["customers", "Customers"]].map(([id, label]) => <button key={id} onClick={() => { setTab(id); setQuery(""); }} className={`min-w-max flex-1 rounded-xl px-5 py-3 text-sm font-bold transition ${tab === id ? "bg-[#173c2b] text-white" : "text-[#68716b] hover:bg-[#f3f3ed]"}`}>{label}</button>)}</nav>
      {error && <div className="mb-5 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700"><AlertTriangle size={17} />{error}</div>}
      {tab === "overview" && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{statCards.map(([label, value, icon, color]) => <article key={label} className="rounded-3xl border border-[#dcded4] bg-white p-5"><div className={`mb-7 grid h-11 w-11 place-items-center rounded-2xl ${color}`}>{icon}</div><p className="text-xs font-bold uppercase tracking-widest text-[#7b847d]">{label}</p><p className="mt-1 text-3xl font-black text-[#18231c]">{loading ? "—" : value}</p></article>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel title="Needs attention"><div className="grid gap-3 sm:grid-cols-2"><Attention value={stats.pendingOrders || 0} label="Pending orders" onClick={() => setTab("orders")} /><Attention value={stats.lowStock || 0} label="Low-stock products" onClick={() => setTab("products")} /></div></Panel><Panel title="Recent orders"><OrderRows orders={data.orders.slice(0, 4)} updateOrder={updateOrder} compact /></Panel></div></>}
      {tab !== "overview" && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#dcded4] bg-white px-4 py-3"><Search size={18} className="text-[#7b847d]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${tab}…`} className="w-full bg-transparent text-sm outline-none" /></div>}
      {tab === "products" && <Panel title={`Items (${products.length})`} action={<Link to="/admin/products" className="text-sm font-bold text-[#526324]">Full product manager →</Link>}><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-b border-[#ecece5] text-xs uppercase tracking-wider text-[#7b847d]"><th className="pb-3">Product</th><th className="pb-3">Category</th><th className="pb-3">Price</th><th className="pb-3">Stock</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{products.map((p) => <tr key={p.id} className="border-b border-[#f0f0ea] last:border-0"><td className="py-3"><div className="flex items-center gap-3"><img src={p.image_url} alt="" loading="lazy" className="h-11 w-11 rounded-xl bg-[#eee] object-cover" /><span className="font-bold text-[#18231c]">{p.name}</span></div></td><td className="text-sm text-[#68716b]">{p.category?.name}</td><td className="font-bold">${p.price}</td><td><span className={Number(p.stock) <= 5 ? "font-bold text-amber-700" : "text-[#68716b]"}>{p.stock}</span></td><td className="text-right"><Link to="/admin/products" className="rounded-lg border border-[#dcded4] px-3 py-2 text-xs font-bold">Edit</Link></td></tr>)}</tbody></table></div></Panel>}
      {tab === "orders" && <Panel title={`Orders (${orders.length})`}><OrderRows orders={orders} updateOrder={updateOrder} /></Panel>}
      {tab === "customers" && <Panel title={`Customers (${filteredCustomers.length})`}><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-[#ecece5] text-xs uppercase tracking-wider text-[#7b847d]"><th className="pb-3">Customer</th><th className="pb-3">Joined</th><th className="pb-3">Orders</th><th className="pb-3">Spent</th><th className="pb-3">Status</th><th className="pb-3 text-right">Access</th></tr></thead><tbody>{filteredCustomers.map((c) => <tr key={c.id} className="border-b border-[#f0f0ea] last:border-0"><td className="py-4"><p className="font-bold text-[#18231c]">{`${c.first_name} ${c.last_name}`.trim() || c.username}</p><p className="text-xs text-[#7b847d]">{c.email || "No email"}</p></td><td className="text-sm text-[#68716b]">{new Date(c.date_joined).toLocaleDateString()}</td><td className="font-bold">{c.order_count}</td><td className="font-bold">${Number(c.total_spent).toFixed(2)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>{c.is_active ? "Active" : "Suspended"}</span></td><td className="text-right"><button onClick={() => toggleCustomer(c)} className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold ${c.is_active ? "text-red-600 hover:bg-red-50" : "text-emerald-700 hover:bg-emerald-50"}`}>{c.is_active ? <UserX size={15} /> : <UserCheck size={15} />}{c.is_active ? "Suspend" : "Restore"}</button></td></tr>)}</tbody></table></div></Panel>}
    </div>
  </main>;
}

function Panel({ title, action, children }) { return <section className="rounded-3xl border border-[#dcded4] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold text-[#18231c]">{title}</h2>{action}</div>{children}</section>; }
function Attention({ value, label, onClick }) { return <button onClick={onClick} className="rounded-2xl bg-[#f4f4ee] p-5 text-left transition hover:bg-[#eceee1]"><p className="text-3xl font-black text-[#18231c]">{value}</p><p className="mt-1 text-sm text-[#68716b]">{label}</p></button>; }
function OrderRows({ orders, updateOrder, compact = false }) { return <div className="divide-y divide-[#ecece5]">{orders.length ? orders.map((o) => <div key={o.id} className="grid items-center gap-3 py-4 sm:grid-cols-[1fr_auto_auto]"><div><p className="font-bold text-[#18231c]">Order #{o.id} · {o.customer?.name || "Guest"}</p><p className="text-xs text-[#7b847d]">{new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })} · {o.items?.length || 0} items</p></div><p className="font-black text-[#18231c]">${Number(o.total_amount).toFixed(2)}</p>{compact ? <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${badge[o.status]}`}>{o.status}</span> : <select value={o.status} onChange={(e) => updateOrder(o.id, e.target.value)} className={`rounded-xl border-0 px-3 py-2 text-xs font-bold capitalize outline-none ${badge[o.status]}`}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>}</div>) : <p className="py-8 text-center text-sm text-[#7b847d]">Nothing here yet.</p>}</div>; }
