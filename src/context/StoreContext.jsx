import { createContext, useContext, useMemo, useState } from "react";
import { products as catalogProducts } from "../data/products";
import { demoAddresses, demoNotifications, demoOrders } from "../utils/demoData";
import { readStorage, writeStorage } from "../utils/storage";

const StoreContext = createContext(null);

function loadDemoProducts() {
  const stored = readStorage("nova-demo-products", catalogProducts);
  if (!Array.isArray(stored)) return catalogProducts;
  return stored.map((product) => {
    const original = catalogProducts.find((entry) => entry.id === product.id);
    return {
      ...original,
      ...product,
      image: product.image || original?.image || catalogProducts[0].image,
      specifications: product.specifications ?? original?.specifications ?? {},
      colors: product.colors ?? original?.colors ?? [],
      reviews: Number(product.reviews) || 0,
    };
  });
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() =>
    typeof fallback === "function" ? fallback() : readStorage(key, fallback),
  );
  function updateValue(next) {
    setValue((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      writeStorage(key, resolved);
      return resolved;
    });
  }
  return [value, updateValue];
}

export function StoreProvider({ children }) {
  const [products, setProducts] = usePersistentState("nova-demo-products", loadDemoProducts);
  const [cart, setCart] = usePersistentState("nova-demo-cart", []);
  const [wishlist, setWishlist] = usePersistentState("nova-demo-wishlist", []);
  const [orders, setOrders] = usePersistentState("nova-demo-orders", demoOrders);
  const [addresses, setAddresses] = usePersistentState("nova-demo-addresses", demoAddresses);
  const [notifications, setNotifications] = usePersistentState("nova-demo-notifications", demoNotifications);
  const [recentlyViewed, setRecentlyViewed] = usePersistentState("nova-demo-recently-viewed", []);
  const [reviews, setReviews] = usePersistentState("nova-demo-reviews", []);
  const [coupons, setCoupons] = usePersistentState("nova-demo-coupons", [{ code: "NOVA10", discount: 10, active: true }]);

  function addToCart(product, quantity = 1, variant = "") {
    if (!product || product.stock < 1) return false;
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.variant === variant);
      const currentQuantity = existing?.quantity ?? 0;
      const nextQuantity = Math.min(product.stock, currentQuantity + quantity);
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: nextQuantity } : item);
      return [...current, { product, quantity: Math.min(product.stock, quantity), variant }];
    });
    return true;
  }

  function updateCartQuantity(productId, quantity, variant = "") {
    const item = cart.find((entry) => entry.product.id === productId && entry.variant === variant);
    if (!item) return;
    setCart((current) => quantity <= 0
      ? current.filter((entry) => entry !== item)
      : current.map((entry) => entry === item
        ? { ...entry, quantity: Math.min(entry.product.stock, Math.max(1, quantity)) }
        : entry));
  }

  function removeFromCart(productId, variant = "") {
    setCart((current) => current.filter((item) => item.product.id !== productId || item.variant !== variant));
  }

  function toggleWishlist(productId) {
    setWishlist((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  }

  function addRecentlyViewed(productId) {
    setRecentlyViewed((current) => [productId, ...current.filter((id) => id !== productId)].slice(0, 12));
  }

  function placeDemoOrder({ customer, paymentMethod, address, coupon, deliveryMethod = "standard" }) {
    const orderItems = cart.map(({ product, quantity, variant }) => ({ productId: product.id, quantity, variant, price: product.price }));
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = coupon && coupons.some((item) => item.code.toUpperCase() === coupon.toUpperCase() && item.active)
      ? subtotal * (coupons.find((item) => item.code.toUpperCase() === coupon.toUpperCase()).discount / 100)
      : 0;
    const shipping = deliveryMethod === "express" ? 9.95 : subtotal - discount >= 75 || subtotal === 0 ? 0 : 6.95;
    const tax = (subtotal - discount) * 0.08;
    const order = {
      id: `NOVA-${Math.floor(10000 + Math.random() * 89999)}`,
      date: new Date().toISOString(),
      status: "Confirmed",
      paymentMethod,
      deliveryMethod,
      paymentStatus: paymentMethod === "Cash on delivery" ? "Demo — due on delivery" : "Demo payment — not charged",
      items: orderItems,
      subtotal,
      discount,
      shipping,
      tax,
      total: subtotal - discount + shipping + tax,
      address,
      customer,
      demo: true,
    };
    setOrders((current) => [order, ...current]);
    setNotifications((current) => [{
      id: `order-${order.id}`,
      title: "Demo order confirmed",
      message: `${order.id} is a demonstration order. No payment was taken.`,
      date: order.date,
      read: false,
    }, ...current]);
    setCart([]);
    return order;
  }

  const value = useMemo(() => ({
    products, setProducts, cart, setCart, wishlist, orders, setOrders, addresses, setAddresses,
    notifications, setNotifications, recentlyViewed, reviews, setReviews, coupons, setCoupons,
    addToCart, updateCartQuantity, removeFromCart, toggleWishlist, addRecentlyViewed, placeDemoOrder,
  }), [products, cart, wishlist, orders, addresses, notifications, recentlyViewed, reviews, coupons]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider.");
  return context;
}
