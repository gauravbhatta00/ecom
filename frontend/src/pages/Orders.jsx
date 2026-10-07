import { apiBaseUrl } from '../lib/config';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Package, ShoppingBag, User } from "lucide-react";
import { authFetch } from "../utils/auth";

const BASEURL = apiBaseUrl;

function SkeletonRow() {
  return <div className="h-28 animate-pulse rounded-2xl bg-[#e8e8e1]" />;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await authFetch(`${BASEURL}/api/orders/`);
        if (!res.ok) throw new Error(`Failed to fetch orders ${res.status}`);
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f6f1] pt-28 pb-20">
      <div className="page-shell max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Order history</p>
            <h1 className="display-font text-4xl tracking-tight text-[#18231c] sm:text-5xl">My orders</h1>
          </div>
          <Link to="/profile" className="inline-flex items-center gap-2 rounded-full border border-[#dedfd7] bg-white px-5 py-2.5 text-sm font-semibold text-[#173c2b] transition hover:border-[#9cab6d]">
            <User size={15} /> Go to profile
          </Link>
        </div>

        {loading && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-[#cfd2c7] bg-white py-24 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f4f4ee] text-[#173c2b]"><ShoppingBag size={26} /></span>
            <div>
              <p className="display-font text-2xl text-[#18231c]">No orders yet</p>
              <p className="mt-1 text-sm text-[#68716b]">Once you place an order, it&apos;ll show up here.</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-[#173c2b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24533d]">Start shopping</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-2xl border border-[#dedfd7] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f4f4ee] text-[#173c2b]"><Package size={17} /></span>
                    <div>
                      <p className="font-semibold text-[#18231c]">Order #{order.id}</p>
                      <p className="text-xs text-[#8a9089]">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f4f4ee] px-3 py-1.5 text-sm font-bold text-[#173c2b]">${Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="mt-4 space-y-1 border-t border-dashed border-[#eeeee7] pt-3">
                  {order.items?.map((item) => (
                    <p className="flex justify-between text-sm text-[#68716b]" key={item.id}>
                      <span>{item.quantity} × {item.product?.name || "Product"}</span>
                      <span className="text-[#18231c]">${Number(item.price).toFixed(2)}</span>
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
