import { apiBaseUrl } from '../lib/config';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, CreditCard, Loader2, Lock, MapPin, Phone, ShoppingBag, User } from "lucide-react";
import { authFetch } from "../utils/auth";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const FIELDS = [
  { name: "name", label: "Full name", placeholder: "Jordan Rivera", icon: User, type: "text" },
  { name: "address", label: "Delivery address", placeholder: "Street, city, ZIP", icon: MapPin, type: "text" },
  { name: "phone", label: "Phone number", placeholder: "+1 555 000 1234", icon: Phone, type: "tel" },
];

export default function CheckoutPage() {
  const [form, setForm] = useState({ name: "", address: "", phone: "", payment_method: "COD" });
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { cartItems, total, clearCart } = useCart();
  const { notify } = useToast();
  const BASEURL = apiBaseUrl;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`${BASEURL}/api/orders/create/`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        clearCart();
        notify("Order placed successfully! We'll get it moving right away.", "success");
        nav("/orders");
      } else {
        notify(data.error || "We couldn't place your order. Please try again.", "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      notify("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] pt-28 pb-20">
      <div className="page-shell">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Step 2 of 2</p>
          <h1 className="display-font text-4xl tracking-tight text-[#18231c] sm:text-5xl">Checkout</h1>
          <p className="mt-2 text-sm text-[#68716b]">Just a few details and your order is on its way.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-[#dedfd7] bg-white p-6 sm:p-8"
          >
            <h2 className="font-semibold text-[#18231c]">Delivery details</h2>

            {FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <label key={field.name} className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">{field.label}</span>
                  <div className="flex items-center gap-3 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-4 py-3 transition focus-within:border-[#9cab6d] focus-within:bg-white">
                    <Icon size={17} className="shrink-0 text-[#788078]" />
                    <input
                      name={field.name}
                      type={field.type}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      className="w-full bg-transparent text-sm text-[#18231c] outline-none placeholder:text-[#a3a89e]"
                    />
                  </div>
                </label>
              );
            })}

            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Payment method</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "COD", label: "Cash on delivery", icon: Banknote },
                  { value: "ONLINE", label: "Online payment", icon: CreditCard },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      type="button"
                      key={method.value}
                      onClick={() => setForm({ ...form, payment_method: method.value })}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        form.payment_method === method.value
                          ? "border-[#173c2b] bg-[#173c2b] text-white"
                          : "border-[#dedfd7] bg-[#f7f6f1] text-[#59635c] hover:border-[#b8c29d]"
                      }`}
                    >
                      <Icon size={17} />
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173c2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Placing order…</> : <><Lock size={15} /> Place order</>}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-[#8a9089]"><Lock size={12} /> Your information is encrypted and secure.</p>
          </motion.form>

          <div className="h-fit rounded-2xl border border-[#dedfd7] bg-white p-6 lg:sticky lg:top-28">
            <h3 className="flex items-center gap-2 font-semibold text-[#18231c]"><ShoppingBag size={17} /> Order summary</h3>
            {cartItems.length === 0 ? (
              <p className="mt-4 text-sm text-[#68716b]">Your cart is empty. <Link to="/products" className="font-semibold text-[#71813d] underline">Go shopping</Link></p>
            ) : (
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="line-clamp-1 text-[#18231c]">{item.quantity} × {item.product_name}</span>
                    <span className="shrink-0 font-semibold text-[#18231c]">${(Number(item.product_price ?? item.price ?? 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="my-4 border-t border-dashed border-[#dedfd7]" />
            <div className="flex justify-between text-base font-bold text-[#18231c]"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
