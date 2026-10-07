import { apiBaseUrl } from '../lib/config';
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ProductImage } from "../components/product/product-image";
import { normalizeProductImage } from "../lib/api/products";

function ProductDetails() {
  const { id } = useParams();
  const BASEURL = apiBaseUrl;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASEURL}/api/products/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch product details");
        setProduct(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, BASEURL]);

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, product, quantity);
    if (success) { setAdded(true); setTimeout(() => setAdded(false), 2000); }
  };

  const imageUrl = normalizeProductImage(product?.image_url || product?.image);
  const stock = Number(product?.stock ?? 0);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f6f1]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#173c2b] border-t-transparent" />
          <p className="text-sm text-[#68716b]">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f6f1] px-6 text-center">
        <div>
          <p className="mb-1 text-lg font-semibold text-[#18231c]">Something went wrong</p>
          <p className="text-sm text-red-500">{error}</p>
          <Link to="/products" className="mt-4 inline-block text-sm font-bold text-[#71813d] underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main className="min-h-screen bg-[#f7f6f1] pt-24 pb-20">
      <div className="page-shell py-5">
        <Link to="/products" className="group mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#68716b] transition hover:text-[#173c2b]">
          <ArrowLeft size={15} className="transition group-hover:-translate-x-0.5" />
          Back to products
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[1.6rem] border border-[#dedfd7] bg-white shadow-sm"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative overflow-hidden bg-[#ecece5] md:w-[55%]">
              {product.category && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#415045] backdrop-blur">
                  {product.category?.name ?? product.category}
                </span>
              )}
              <div className="relative aspect-square w-full overflow-hidden">
                <ProductImage
                  key={imageUrl}
                  src={imageUrl}
                  alt={product.name}
                  sizes="(max-width: 767px) 94vw, (max-width: 1440px) 52vw, 704px"
                  priority
                  className="h-full w-full object-cover transition duration-700 ease-out hover:scale-105"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-[#eeeee7] p-8 md:w-[45%] md:border-l md:border-t-0 md:p-10">
              <div className="space-y-5">
                <div>
                  <h1 className="display-font text-3xl leading-snug text-[#18231c]">{product.name}</h1>
                  <p className="mt-2 text-sm leading-relaxed text-[#68716b]">{product.description}</p>
                </div>

                <div className="flex items-baseline justify-between gap-2 border-y border-[#eeeee7] py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#173c2b]">${parseFloat(product.price).toFixed(2)}</span>
                    <span className="text-xs text-[#a3a89e]">incl. tax</span>
                  </div>
                  <span className={`text-xs font-semibold ${stock > 0 ? "text-[#66802a]" : "text-red-500"}`}>{stock > 0 ? `${stock} in stock` : "Out of stock"}</span>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#7c857d]">Quantity</p>
                  <div className="inline-flex items-center overflow-hidden rounded-full border border-[#dedfd7] bg-[#f7f6f1]">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-[#173c2b] transition hover:bg-white" aria-label="Decrease quantity">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-[#18231c]">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="grid h-10 w-10 place-items-center text-[#173c2b] transition hover:bg-white" aria-label="Increase quantity">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[
                    { icon: Truck, label: "Free shipping on orders over $50" },
                    { icon: RotateCcw, label: "Easy 30-day returns" },
                    { icon: ShieldCheck, label: "Secure checkout" },
                  ].map((perk) => {
                    const Icon = perk.icon;
                    return (
                      <li key={perk.label} className="flex items-center gap-2.5 text-xs text-[#68716b]">
                        <Icon size={14} className="shrink-0 text-[#71813d]" />
                        {perk.label}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                    added ? "bg-[#66802a] text-white" : "bg-[#173c2b] text-white hover:bg-[#24533d]"
                  }`}
                >
                  {added ? <><Check size={16} /> Added to cart</> : <><ShoppingBag size={16} /> Add to cart · {quantity}</>}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-xs text-[#8a9089]">
                    <Link to="/login" className="font-semibold text-[#71813d] underline">Log in</Link> to save your cart across devices.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default ProductDetails;
