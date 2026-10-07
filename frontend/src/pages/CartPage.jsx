import { apiBaseUrl } from '../lib/config';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductImage } from "../components/product/product-image";
import { normalizeProductImage } from "../lib/api/products";

export default function CartPage() {
  const { cartItems, total, removeFromCart, updateQuantity } = useCart();
  const BASEURL = apiBaseUrl;
  const count = cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  return (
    <main className="min-h-screen bg-[#f7f6f1] pt-28 pb-20">
      <div className="page-shell">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Step 1 of 2</p>
          <h1 className="display-font text-4xl tracking-tight text-[#18231c] sm:text-5xl">Your cart</h1>
          <p className="mt-2 text-sm text-[#68716b]">{count > 0 ? `${count} item${count > 1 ? "s" : ""} ready for checkout.` : "Nothing here yet."}</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-[#cfd2c7] bg-white py-24 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f4f4ee] text-[#173c2b]">
              <ShoppingBag size={26} />
            </span>
            <div>
              <p className="display-font text-2xl text-[#18231c]">Your cart is empty</p>
              <p className="mt-1 text-sm text-[#68716b]">Explore the collection and find something you&apos;ll love.</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-[#173c2b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24533d]">
              Browse products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => {
                  const image = item.product_image
                    ? (String(item.product_image).startsWith("http") ? item.product_image : `${BASEURL}${item.product_image}`)
                    : null;
                  const lineTotal = Number(item.product_price ?? item.price ?? 0) * Number(item.quantity ?? 1);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#dedfd7] bg-white p-4 sm:flex-nowrap sm:gap-5 sm:p-5"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#ecece5]">
                        {image ? <ProductImage key={image} src={normalizeProductImage(image)} alt={item.product_name} sizes="80px" /> : <div className="grid h-full w-full place-items-center text-[#a7ada2]"><ShoppingBag size={22} /></div>}
                      </div>

                      <div className="min-w-[9rem] flex-1">
                        <h2 className="font-semibold text-[#18231c]">{item.product_name}</h2>
                        <p className="mt-1 text-sm text-[#68716b]">${Number(item.product_price ?? item.price ?? 0).toFixed(2)} each</p>
                      </div>

                      <div className="flex items-center rounded-full border border-[#dedfd7] bg-[#f7f6f1]">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-9 w-9 place-items-center rounded-full text-[#173c2b] transition hover:bg-white" aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#18231c]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid h-9 w-9 place-items-center rounded-full text-[#173c2b] transition hover:bg-white" aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="ml-auto flex items-center gap-4 sm:ml-0">
                        <span className="w-20 text-right font-bold text-[#173c2b]">${lineTotal.toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Remove item" className="grid h-9 w-9 place-items-center rounded-full text-[#a7ada2] transition hover:bg-red-50 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="h-fit rounded-2xl border border-[#dedfd7] bg-white p-6 lg:sticky lg:top-28">
              <h3 className="font-semibold text-[#18231c]">Order summary</h3>
              <div className="mt-4 space-y-2 text-sm text-[#68716b]">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-[#18231c]">${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="font-semibold text-[#66802a]">Free</span></div>
              </div>
              <div className="my-4 border-t border-dashed border-[#dedfd7]" />
              <div className="flex justify-between text-base font-bold text-[#18231c]"><span>Total</span><span>${total.toFixed(2)}</span></div>

              <Link to="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173c2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#24533d]">
                Proceed to checkout <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="mt-3 block text-center text-sm font-semibold text-[#71813d] hover:underline">Continue shopping</Link>

              <div className="mt-6 space-y-2 border-t border-[#eeeee7] pt-5 text-xs text-[#788078]">
                <span className="flex items-center gap-2"><Truck size={15} className="text-[#71813d]" /> Fast, tracked delivery</span>
                <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#71813d]" /> Secure checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
