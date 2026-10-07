import { syncGuestItems } from "../lib/api/cart";
import { apiBaseUrl } from '../lib/config';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "../utils/auth";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const BASEURL = apiBaseUrl;
const GUEST_CART_KEY = "guest_cart";

const getGuestCart = () => {
    try {
        const data = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
        return Array.isArray(data) ? data.filter(item => item && Number.isFinite(Number(item.product_id ?? item.id)) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch {
        return [];
    }
};

const setGuestCart = (items) => {
    try { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)); } catch { /* Cart remains usable in memory. */ }
};

const clearGuestCart = () => {
    try { localStorage.removeItem(GUEST_CART_KEY); } catch { /* Storage may be unavailable. */ }
};

const calcTotal = (items) => {
    return items.reduce((sum, item) => {
        const price = Number(item.product_price ?? item.price ?? 0);
        const qty = Number(item.quantity ?? 0);
        return sum + price * qty;
    }, 0);
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated, sessionLoading } = useAuth();
    const [cartItems, setCartItemsState] = useState([]);
    const cartRef = useRef([]);
    const setCartItems = useCallback(items => { cartRef.current = items; setCartItemsState(items); }, []);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            const guestItems = getGuestCart();
            setCartItems(guestItems);
            setTotal(calcTotal(guestItems));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${BASEURL}/api/cart/`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCartItems(data.items || []);
            setTotal(Number(data.total ?? calcTotal(data.items || [])));
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError("Failed to load cart.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, setCartItems]);

    const syncGuestCartToServer = useCallback(async () => {
        const guestItems = getGuestCart();
        if (!guestItems.length) return;


        try {
            await syncGuestItems(guestItems, setGuestCart);
            clearGuestCart();
        } catch (err) {
            console.error("Error syncing guest cart:", err);
        }
    }, []);

    useEffect(() => {
        if (sessionLoading) return;
        if (isAuthenticated) {
            (async () => {
                setLoading(true);
                await syncGuestCartToServer();
                fetchCart();
            })();
        } else {
            const guestItems = getGuestCart();
            setCartItems(guestItems);
            setTotal(calcTotal(guestItems));
            setLoading(false);
        }
    }, [isAuthenticated, sessionLoading, fetchCart, syncGuestCartToServer, setCartItems]);

    const addToCart = async (productId, productData = null, quantity = 1) => {
        if (sessionLoading || loading || !Number.isInteger(quantity) || quantity < 1) return false;
        setError(null);
        if (!isAuthenticated) {
            let product = productData;
            if (!product) {
                try {
                    const res = await fetch(`${BASEURL}/api/products/${productId}/`);
                    if (!res.ok) throw new Error(`Could not fetch product ${productId}`);
                    product = await res.json();
                } catch (err) {
                    console.error("Error fetching product for guest cart:", err);
                    setError("Failed to add item.");
                    return false;
                }
            }

            const current = cartRef.current;
            const existing = current.find((item) => Number(item.product_id ?? item.id) === Number(productId));
            if (Number(existing?.quantity || 0) + quantity > Number(product.stock || 0)) { setError("Not enough stock available."); return false; }
            let updated;
            if (existing) {
                updated = current.map((item) =>
                    Number(item.product_id ?? item.id) === Number(productId)
                        ? { ...item, quantity: (Number(item.quantity) || 0) + quantity }
                        : item
                );
            } else {
                const newItem = {
                    id: productId,
                    product_id: productId,
                    product_name: product.name,
                    product_price: product.price,
                    product_image: product.image_url || product.image,
                    quantity,
                };
                updated = [...current, newItem];
            }

            setCartItems(updated);
            setTotal(calcTotal(updated));
            setGuestCart(updated);
            return true;
        }

        try {
            const existing = cartRef.current.find(item => Number(item.product ?? item.product_id) === Number(productId));
            if (productData && Number(existing?.quantity || 0) + quantity > Number(productData.stock || 0)) throw new Error("Not enough stock available.");
            for (let i = 0; i < quantity; i++) {
                const response = await authFetch(`${BASEURL}/api/cart/add/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: productId }),
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (data.cart) { setCartItems(data.cart.items || []); setTotal(Number(data.cart.total ?? calcTotal(data.cart.items || []))); }
            }
            return true;
        } catch (err) {
            console.error("Error adding to cart:", err);
            setError("Failed to add item.");
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        if (!isAuthenticated) {
            const updated = cartItems.filter(
                (item) => Number(item.product_id ?? item.id) !== Number(itemId)
            );
            setCartItems(updated);
            setTotal(calcTotal(updated));
            setGuestCart(updated);
            return;
        }

        try {
            await authFetch(`${BASEURL}/api/cart/remove/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId }),
            });
            await fetchCart();
        } catch (err) {
            console.error("Error removing from cart:", err);
            setError("Failed to remove item.");
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId);
            return;
        }

        if (!isAuthenticated) {
            const updated = cartItems.map((item) =>
                Number(item.product_id ?? item.id) === Number(itemId)
                    ? { ...item, quantity }
                    : item
            );
            setCartItems(updated);
            setTotal(calcTotal(updated));
            setGuestCart(updated);
            return;
        }

        try {
            await authFetch(`${BASEURL}/api/cart/update/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId, quantity }),
            });
            await fetchCart();
        } catch (err) {
            console.error("Error updating quantity:", err);
            setError("Failed to update quantity.");
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setTotal(0);
        if (!isAuthenticated) clearGuestCart();
    };

    return (
        <CartContext.Provider
            value={{ cartItems, total, loading, error, addToCart, removeFromCart, updateQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
