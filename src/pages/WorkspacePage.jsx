import { useMemo, useState } from "react";
import { ArrowRight, Check, Download, Plus, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AddressForm from "../components/AddressForm";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import OrderTimeline from "../components/OrderTimeline";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { calculateCart, formatCurrency } from "../utils/currency";
import { readStorage, writeStorage } from "../utils/storage";

const titles = {
  cart: "Your shopping bag", checkout: "Checkout", success: "Demo order placed",
  orders: "Your orders", order: "Order details", track: "Track this demo order",
  cancel: "Cancel demo order", returns: "Returns & refunds (demo)",
  wishlist: "Your wishlist", recently: "Recently viewed", profile: "Your account",
  editProfile: "Edit profile", addresses: "Your address book", payments: "Payment methods",
  reviews: "Your reviews", notifications: "Notifications", help: "How can we help?",
  contact: "Get in touch", about: "Our little way", admin: "Store overview",
  adminProducts: "Product management", adminOrders: "Order management",
  adminUsers: "Customer directory", adminCategories: "Category management",
  adminInventory: "Inventory overview", adminCoupons: "Coupon management",
  adminReviews: "Review moderation", adminReports: "Sales reports",
};

function WorkspacePage({ section }) {
  const {
    products, setProducts, cart, updateCartQuantity, removeFromCart, wishlist, toggleWishlist,
    orders, setOrders, addresses, setAddresses, notifications, setNotifications,
    recentlyViewed, reviews, setReviews, coupons, setCoupons, addToCart, placeDemoOrder,
  } = useStore();
  const { user, setUser } = useAuth();
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on delivery");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [addressId, setAddressId] = useState(addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [newAddress, setNewAddress] = useState({});
  const [editAddressId, setEditAddressId] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? "");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [adminProduct, setAdminProduct] = useState({ name: "", category: "Home", brand: "NOVA", price: "", stock: "", image: "" });
  const [adminSearch, setAdminSearch] = useState("");
  const [productDialog, setProductDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const appliedCoupon = coupons.find((entry) => entry.code.toLowerCase() === coupon.trim().toLowerCase() && entry.active);
  const totals = calculateCart(cart, appliedCoupon?.code ?? "", appliedCoupon?.discount ?? 10);
  const checkoutTotals = deliveryMethod === "express"
    ? { ...totals, shipping: 9.95, total: totals.subtotal - totals.discount + 9.95 + totals.tax }
    : totals;
  const filteredOrders = useMemo(() => user?.role === "admin" ? orders : orders, [orders, user]);
  const selectedOrder = orderId ? orders.find((order) => order.id === orderId) : orders[0];
  const routeTitle = section === "category" ? decodeURIComponent(location.pathname.split("/").pop() ?? "") : titles[section] ?? "Good things";

  function notify(message) {
    setFormMessage(message);
    window.setTimeout(() => setFormMessage(""), 3500);
  }

  function applyCoupon() {
    const found = appliedCoupon;
    setCouponMessage(found ? `${found.discount}% demo discount applied.` : "That demo coupon is not available.");
    if (!found) setCoupon("");
  }

  function submitAddress(event) {
    event.preventDefault();
    if (["name", "phone", "line1", "city", "state", "postalCode", "country"].some((field) => !newAddress[field]?.trim())) {
      notify("Please complete the required address fields.");
      return;
    }
    if (editAddressId) {
      setAddresses((current) => current.map((address) => address.id === editAddressId ? { ...newAddress, id: editAddressId, isDefault: address.isDefault } : address));
      setEditAddressId(null);
      notify("Address updated on this device.");
    } else {
      const address = { ...newAddress, id: crypto.randomUUID(), isDefault: addresses.length === 0 };
      setAddresses((current) => [...current, address]);
      setAddressId(address.id);
      notify("Address saved on this device.");
    }
    setNewAddress({});
  }

  function checkout() {
    if (!cart.length) return;
    const address = addresses.find((item) => item.id === addressId);
    if (!address) {
      notify("Add or select a shipping address first.");
      return;
    }
    const invalidStock = cart.some((item) => item.quantity > item.product.stock);
    if (invalidStock) {
      notify("A cart quantity exceeds the current demo stock.");
      return;
    }
    const order = placeDemoOrder({ customer: user ?? { name: profileName || "Guest shopper", email: "guest@nova.demo" }, paymentMethod, address, coupon, deliveryMethod });
    navigate(`/order-success?order=${encodeURIComponent(order.id)}`);
  }

  function setOrderStatus(order, status) {
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
    notify(`Demo order ${order.id} updated to ${status}.`);
  }

  function addProduct(event) {
    event.preventDefault();
    if (!adminProduct.name.trim() || Number(adminProduct.price) <= 0 || Number(adminProduct.stock) < 0) {
      notify("Enter a product name, a positive price, and valid stock.");
      return;
    }
    const item = {
      ...adminProduct,
      id: `demo-${crypto.randomUUID().slice(0, 8)}`,
      sku: `DEMO-${Date.now()}`,
      price: Number(adminProduct.price),
      stock: Number(adminProduct.stock),
      image: adminProduct.image.trim() || products[0]?.image || "",
      rating: 0,
      reviews: 0,
      description: "A new product in your local admin demo.",
      specifications: {},
      colors: [],
    };
    setProducts((current) => [item, ...current]);
    setAdminProduct({ name: "", category: "Home", brand: "NOVA", price: "", stock: "", image: "" });
    setProductDialog(false);
    notify("Demo product created on this device.");
  }

  function exportCsv() {
    const rows = [["Order", "Date", "Status", "Total"], ...orders.map((order) => [order.id, order.date, order.status, order.total])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "nova-demo-orders.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function saveProfile(event) {
    event.preventDefault();
    const updated = { ...user, name: profileName.trim(), phone: profilePhone.trim() };
    setUser(updated);
    localStorage.setItem("nova-demo-user", JSON.stringify(updated));
    notify("Profile saved locally. Passwords are not stored.");
  }

  function addReview(event) {
    event.preventDefault();
    if (reviewText.trim().length < 10) {
      notify("Please write at least 10 characters.");
      return;
    }
    setReviews((current) => [{ id: crypto.randomUUID(), author: user?.name ?? "Demo shopper", rating: reviewRating, text: reviewText.trim(), date: new Date().toISOString(), demo: true }, ...current]);
    setReviewText("");
    notify("Demo review saved on this device.");
  }

  function toggleRead(notification) {
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: !item.read } : item));
  }

  const heading = <div className="workspace-heading"><div><span className="eyebrow">NOVA · {user?.role === "admin" && section.startsWith("admin") ? "ADMIN DEMO" : "DEMO MODE"}</span><h1>{routeTitle}</h1></div>{section === "adminProducts" && <button className="primary-button" type="button" onClick={() => setProductDialog(!productDialog)}><Plus size={16} /> Add product</button>}{section === "adminReports" && <button className="secondary-button" type="button" onClick={exportCsv}><Download size={16} /> Export CSV</button>}</div>;
  const notice = formMessage && <p className="workspace-notice" role="status"><Check size={15} />{formMessage}</p>;

  if (section === "cart") return <main className="content-page workspace-page">{heading}{notice}{cart.length ? <div className="cart-layout"><section className="cart-list">{cart.map((item) => <CartItem key={`${item.product.id}-${item.variant}`} item={item} onQuantity={(entry, quantity) => updateCartQuantity(entry.product.id, quantity, entry.variant)} onRemove={(entry) => removeFromCart(entry.product.id, entry.variant)} />)}<button className="text-button" type="button" onClick={() => cart.forEach((item) => removeFromCart(item.product.id, item.variant))}>Clear cart</button><Link className="secondary-button" to="/products">Continue shopping</Link></section><div className="cart-side"><div className="coupon-row"><label htmlFor="coupon-code">Demo coupon</label><div><input id="coupon-code" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Try NOVA10" /><button type="button" onClick={applyCoupon}>Apply</button></div>{couponMessage && <small>{couponMessage}</small>}</div><OrderSummary summary={totals} /><Link className="primary-button full-button" to="/checkout">Proceed to checkout <ArrowRight size={16} /></Link><p className="demo-disclaimer">Demo cart is saved on this device. Price, tax, and stock must be verified by a backend.</p></div></div> : <div className="empty-panel"><h2>Your bag is taking a little breather.</h2><p>Add something lovely and it will appear here.</p><Link className="primary-button" to="/products">Find something lovely <ArrowRight size={16} /></Link></div>}</main>;

  if (section === "checkout") return <main className="content-page workspace-page">{heading}{notice}{!cart.length ? <div className="empty-panel"><h2>Your cart is empty.</h2><Link to="/products" className="primary-button">Browse the collection</Link></div> : <div className="checkout-layout"><div className="checkout-steps">
    <section className="checkout-card"><span className="step-number">1</span><div><h2>Review your bag</h2>{cart.map((item) => <p key={item.product.id}>{item.product.name} × {item.quantity} <b>{formatCurrency(item.product.price * item.quantity)}</b></p>)}</div></section>
    <section className="checkout-card"><span className="step-number">2</span><div className="checkout-card-main"><h2>Shipping address</h2>{addresses.map((address) => <label className="address-choice" key={address.id}><input type="radio" name="ship-address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} /><span><b>{address.name}</b><br />{address.line1}, {address.city}, {address.state} {address.postalCode}</span></label>)}<AddressForm value={newAddress} onChange={setNewAddress} onSubmit={submitAddress} submitLabel="Add another address" /></div></section>
    <section className="checkout-card"><span className="step-number">3</span><div><h2>Delivery</h2><label className="address-choice"><input type="radio" checked={deliveryMethod === "standard"} name="delivery" onChange={() => setDeliveryMethod("standard")} /> Standard delivery · Free over $75</label><label className="address-choice"><input type="radio" checked={deliveryMethod === "express"} name="delivery" onChange={() => setDeliveryMethod("express")} /> Express delivery · Demo +$9.95</label></div></section>
    <section className="checkout-card"><span className="step-number">4</span><div><h2>Payment method</h2><p className="demo-disclaimer">These are interface demonstrations only. No payment is collected.</p>{["Cash on delivery", "Online payment (demo only)"].map((method) => <label className="address-choice" key={method}><input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />{method}</label>)}</div></section>
    <button className="primary-button confirm-order" type="button" onClick={checkout}>Place demo order · {formatCurrency(checkoutTotals.total)} <ArrowRight size={17} /></button>
  </div><div><div className="coupon-row"><label htmlFor="checkout-coupon">Coupon code</label><div><input id="checkout-coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Try NOVA10" /><button type="button" onClick={applyCoupon}>Apply</button></div>{couponMessage && <small>{couponMessage}</small>}</div><OrderSummary summary={checkoutTotals} /><p className="demo-disclaimer">This checkout creates a local demo order only. No payment, shipment, or email will occur.</p></div></div>}</main>;

  if (section === "success") {
    const order = orders.find((item) => item.id === new URLSearchParams(location.search).get("order")) ?? orders[0];
    return <main className="content-page success-page"><span className="success-check"><Check size={26} /></span><span className="eyebrow">THANKS FOR EXPLORING NOVA</span><h1>Your demo order is ready.</h1><p>No payment was processed and no real order was placed.</p>{order && <div className="success-order"><b>Demo order {order.id}</b><span>{formatCurrency(order.total)}</span></div>}<div className="success-actions"><Link className="primary-button" to="/orders">View demo orders</Link><Link className="secondary-button" to="/products">Continue shopping</Link></div></main>;
  }

  if (section === "orders" || section === "adminOrders") return <main className="content-page workspace-page">{heading}{notice}{filteredOrders.length ? <div className="order-list">{filteredOrders.map((order) => <article className="order-card" key={order.id}><header><span><small>DEMO ORDER</small><b>{order.id}</b></span><span><small>ORDER DATE</small><b>{new Date(order.date).toLocaleDateString()}</b></span><span><small>STATUS</small><b className="status-chip">{order.status}</b></span><span><small>TOTAL</small><b>{formatCurrency(order.total)}</b></span></header><div className="order-card-body">{order.items.map((item) => { const product = products.find((entry) => entry.id === item.productId); return <div className="order-mini-item" key={item.productId}><img src={product?.image || products[0]?.image} alt="" /><span>{product?.name ?? item.productId} · Qty {item.quantity}</span></div>; })}<div className="order-card-actions"><Link to={`/orders/${order.id}`}>View details</Link><Link to={`/orders/${order.id}/track`}>Track order</Link>{order.status !== "Delivered" && order.status !== "Cancelled" && <Link to={`/orders/${order.id}/cancel`}>Cancel</Link>}{order.status === "Delivered" && <Link to={`/orders/${order.id}/return`}>Request return</Link>}{user?.role === "admin" && <select aria-label={`Update ${order.id} status`} value={order.status} onChange={(event) => setOrderStatus(order, event.target.value)}>{["Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => <option key={status}>{status}</option>)}</select>}</div></div></article>)}</div> : <div className="empty-panel"><h2>No orders just yet.</h2><p>Demo orders you place will appear here.</p><Link to="/products" className="primary-button">Browse the collection</Link></div>}</main>;

  if (section === "order" || section === "track") return <main className="content-page workspace-page">{heading}{selectedOrder ? <><div className="order-detail-top"><span>Order <b>{selectedOrder.id}</b></span><span>Placed {new Date(selectedOrder.date).toLocaleDateString()}</span><span className="status-chip">{selectedOrder.status}</span>{section === "order" && <button className="secondary-button invoice-print" type="button" onClick={() => window.print()}><Download size={14} /> Print demo invoice</button>}</div><OrderTimeline status={selectedOrder.status} /><div className="detail-columns"><section className="data-card invoice-print-area"><span className="eyebrow">NOVA · DEMO INVOICE</span><h2>Items in this order</h2><p>Invoice reference {selectedOrder.id} · {new Date(selectedOrder.date).toLocaleDateString()}</p>{selectedOrder.items.map((item) => { const product = products.find((entry) => entry.id === item.productId); return <div className="cart-line" key={item.productId}><img src={product?.image || products[0]?.image} alt="" /><div className="cart-line-info"><b>{product?.name ?? item.productId}</b><small>Quantity {item.quantity}</small></div><strong>{formatCurrency((item.price ?? product?.price ?? 0) * item.quantity)}</strong></div>; })}<p>Payment: {selectedOrder.paymentMethod} · {selectedOrder.paymentStatus}</p><p>Shipping address: {selectedOrder.address ? `${selectedOrder.address.line1}, ${selectedOrder.address.city}, ${selectedOrder.address.state} ${selectedOrder.address.postalCode}` : "Sample demo address"}</p></section><OrderSummary summary={selectedOrder} title="Demo total" /></div><div className="demo-disclaimer">This is a printable demo invoice preview—not a tax invoice. Tracking number, payment, shipment, and refunds are simulated.</div></> : <div className="empty-panel">No demo order found. <Link to="/orders">See all orders</Link></div>}</main>;

  if (section === "cancel" || section === "returns") return <main className="content-page workspace-page">{heading}{selectedOrder ? <section className="data-card form-card"><p>Order: <b>{selectedOrder.id}</b> · current status: {selectedOrder.status}</p><label>{section === "cancel" ? "Why are you cancelling?" : "Why would you like to return this demo order?"}<select value={confirmText} onChange={(event) => setConfirmText(event.target.value)}><option value="">Choose a reason</option>{(section === "cancel" ? ["Changed my mind", "Ordered by mistake", "Other"] : ["Item not suitable", "Arrived damaged (demo)", "Other"]).map((reason) => <option key={reason}>{reason}</option>)}</select></label><p className="demo-disclaimer">This only changes the demo order on your device; no refund or pickup is arranged.</p><button type="button" className="primary-button" disabled={!confirmText} onClick={() => { setOrderStatus(selectedOrder, section === "cancel" ? "Cancelled" : "Return requested"); navigate("/orders"); }}>{section === "cancel" ? "Confirm demo cancellation" : "Submit demo return request"}</button></section> : <div className="empty-panel">No demo order found.</div>}</main>;

  if (section === "wishlist" || section === "recently") {
    const ids = section === "wishlist" ? wishlist : recentlyViewed;
    const items = ids.map((id) => products.find((product) => product.id === id)).filter(Boolean);
    return <main className="content-page workspace-page">{heading}{items.length ? <div className="product-grid">{items.map((product) => <div key={product.id}><ProductCard product={product} /><button className="text-button" type="button" onClick={() => { if (section === "wishlist") toggleWishlist(product.id); else addToCart(product); }}> {section === "wishlist" ? "Remove from wishlist" : "Add to bag"} </button></div>)}</div> : <div className="empty-panel"><h2>{section === "wishlist" ? "Nothing saved yet." : "Your recently viewed shelf is empty."}</h2><Link className="primary-button" to="/products">Explore the collection</Link></div>}</main>;
  }

  if (section === "profile" || section === "editProfile") return <main className="content-page workspace-page">{heading}{section === "profile" ? <><div className="stats-grid"><div><b>{orders.length}</b><span>Total demo orders</span></div><div><b>{orders.filter((order) => order.status === "Processing" || order.status === "Shipped").length}</b><span>On their way</span></div><div><b>{orders.filter((order) => order.status === "Delivered").length}</b><span>Delivered</span></div><div><b>{wishlist.length}</b><span>Wishlist finds</span></div></div><div className="account-links-grid">{[["Edit profile", "/profile/edit"], ["Address book", "/profile/addresses"], ["Orders", "/orders"], ["Wishlist", "/wishlist"], ["Recently viewed", "/recently-viewed"], ["Reviews", "/profile/reviews"], ["Notifications", "/notifications"], ["Help & support", "/help"]].map(([label, href]) => <Link to={href} key={href}>{label}<ArrowRight size={15} /></Link>)}</div><p className="demo-disclaimer">Your profile and activity are sample data stored on this browser only.</p></> : <form className="data-card form-card" onSubmit={saveProfile}><label>Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} required /></label><label>Email address<input type="email" value={user?.email ?? ""} readOnly /></label><label>Phone number<input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} /></label><button className="primary-button">Save profile</button>{notice}</form>}</main>;

  if (section === "addresses") return <main className="content-page workspace-page">{heading}{notice}<div className="address-cards">{addresses.map((address) => <article className="data-card" key={address.id}><div className="address-card-heading"><b>{address.name}</b>{address.isDefault && <span className="status-chip">Default</span>}</div><p>{address.phone}<br />{address.line1} {address.line2}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</p><div className="workspace-actions"><button type="button" onClick={() => { setNewAddress(address); setEditAddressId(address.id); }}>Edit</button><button type="button" onClick={() => setAddresses((current) => current.filter((item) => item.id !== address.id))}>Delete</button>{!address.isDefault && <button type="button" onClick={() => setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === address.id })))}>Set default</button>}</div></article>)}<section className="data-card form-card"><h2>{editAddressId ? "Edit address" : "Add a new address"}</h2><AddressForm value={newAddress} onChange={setNewAddress} onSubmit={submitAddress} submitLabel={editAddressId ? "Update address" : "Save address"} /></section></div></main>;

  if (section === "payments") return <main className="content-page workspace-page">{heading}<section className="data-card"><h2>Payment options (demo)</h2><p>No card numbers, CVVs, UPI PINs, or other payment credentials are collected or stored.</p><div className="payment-option">Cash on delivery <span>Available in demo checkout</span></div><div className="payment-option">Online payment <span>Display option only · no gateway connected</span></div></section></main>;

  if (section === "notifications") return <main className="content-page workspace-page">{heading}<button className="secondary-button" type="button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}>Mark all as read</button><div className="notification-list">{notifications.map((notification) => <article className={`notification-item${notification.read ? "" : " notification-unread"}`} key={notification.id}><button type="button" onClick={() => toggleRead(notification)}><span className="notification-dot" /><span><b>{notification.title}</b><small>{notification.message}</small><time>{new Date(notification.date).toLocaleString()}</time></span><small>{notification.read ? "Read" : "Mark read"}</small></button></article>)}</div>{!notifications.length && <div className="empty-panel">No notifications.</div>}</main>;

  if (section === "reviews") return <main className="content-page workspace-page">{heading}<form className="data-card form-card" onSubmit={addReview}><h2>Write a demo review</h2><label>Rating<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} stars</option>)}</select></label><label>Your review<textarea rows="4" value={reviewText} onChange={(event) => setReviewText(event.target.value)} minLength={10} required /></label><button className="primary-button">Save demo review</button></form>{reviews.map((review) => <article className="data-card review-card" key={review.id}><b>{review.author} · {review.rating} ★</b><p>{review.text}</p><small>Demo review · {new Date(review.date).toLocaleDateString()}</small><button className="text-button" type="button" onClick={() => setReviews((current) => current.filter((item) => item.id !== review.id))}>Delete</button></article>)}{!reviews.length && <p>No demo reviews yet.</p>}</main>;

  if (section.startsWith("admin")) return <AdminWorkspace section={section} {...{ heading, notice, orders, products, reviews, coupons, setCoupons, setProducts, setOrders, adminSearch, setAdminSearch, adminProduct, setAdminProduct, productDialog, setProductDialog, addProduct, notify, exportCsv }} />;

  return <main className="content-page workspace-page">{heading}{notice}<section className="data-card help-card"><h2>{section === "contact" ? "Send us a demo note" : section === "about" ? "A softer kind of everyday" : "Helpful answers, without the fuss."}</h2><p>{section === "about" ? "NOVA is a small demonstration storefront for thoughtfully selected everyday objects. This prototype keeps profile, orders, and preferences in your browser and never takes real payment." : "This is a frontend demonstration. No real support message is sent and no order, delivery, or refund is created."}</p>{section !== "about" && <form className="form-card" onSubmit={(event) => { event.preventDefault(); notify("Demo message saved for this session only."); event.currentTarget.reset(); }}><label>Your name<input required /></label><label>Email address<input type="email" required /></label><label>How can we help?<textarea rows="4" required /></label><button className="primary-button">Save demo message</button></form>}</section></main>;
}

function AdminWorkspace({ section, heading, notice, orders, products, reviews, coupons, setCoupons, setProducts, setOrders, adminSearch, setAdminSearch, adminProduct, setAdminProduct, productDialog, setProductDialog, addProduct, notify, exportCsv }) {
  const navItems = [["Overview", "/admin"], ["Products", "/admin/products"], ["Orders", "/admin/orders"], ["Customers", "/admin/users"], ["Categories", "/admin/categories"], ["Inventory", "/admin/inventory"], ["Coupons", "/admin/coupons"], ["Reviews", "/admin/reviews"], ["Reports", "/admin/reports"]];
  const filteredProducts = products.filter((product) => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(adminSearch.toLowerCase()));
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("10");
  const [newCategory, setNewCategory] = useState("");
  const [categoryList, setCategoryList] = useState(() =>
    readStorage("nova-demo-categories", [...new Set(products.map((product) => product.category))]),
  );
  function updateCategories(next) {
    setCategoryList(next);
    writeStorage("nova-demo-categories", next);
  }
  function addCoupon(event) {
    event.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,16}$/.test(code) || Number(couponDiscount) < 1 || Number(couponDiscount) > 80) {
      notify("Use a 3–16 character code and a discount from 1% to 80%.");
      return;
    }
    setCoupons((current) => [...current.filter((item) => item.code !== code), { code, discount: Number(couponDiscount), active: true }]);
    setCouponCode("");
    notify(`Demo coupon ${code} saved.`);
  }
  const revenues = orders.reduce((sum, order) => sum + order.total, 0);

  return <main className="content-page workspace-page admin-page">{heading}{notice}<div className="admin-layout"><aside className="admin-nav"><b>STORE ADMIN · DEMO</b>{navItems.map(([label, href]) => <Link className={window.location.pathname === href ? "admin-nav-active" : ""} to={href} key={href}>{label}</Link>)}</aside><section className="admin-content">
    {section === "admin" && <><div className="stats-grid"><div><b>{formatCurrency(revenues)}</b><span>Demo order revenue</span></div><div><b>{orders.length}</b><span>Demo orders</span></div><div><b>—</b><span>Real customers</span></div><div><b>{products.length}</b><span>Catalog items</span></div></div><div className="data-card"><h2>Order status overview</h2><div className="admin-bars">{["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => { const count = orders.filter((order) => order.status === status).length; return <div key={status}><span>{status}</span><div><i style={{ width: `${Math.max(count / Math.max(orders.length, 1) * 100, count ? 8 : 0)}%` }} /></div><b>{count}</b></div>; })}</div></div><div className="data-card"><h2>Recent demo orders</h2><Link to="/admin/orders">Manage demo orders <ArrowRight size={14} /></Link></div></>}
    {section === "adminProducts" && <><label className="table-search">Search products<input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Name, SKU, category" /></label>{productDialog && <form className="data-card admin-product-form" onSubmit={addProduct}><h2>New demo product</h2><div className="admin-form-grid"><label>Name<input value={adminProduct.name} onChange={(event) => setAdminProduct({ ...adminProduct, name: event.target.value })} required /></label><label>Category<select value={adminProduct.category} onChange={(event) => setAdminProduct({ ...adminProduct, category: event.target.value })}>{["Home", "Accessories", "Stationery", "Wellness"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Brand<input value={adminProduct.brand} onChange={(event) => setAdminProduct({ ...adminProduct, brand: event.target.value })} required /></label><label>Price<input type="number" min="0.01" step="0.01" value={adminProduct.price} onChange={(event) => setAdminProduct({ ...adminProduct, price: event.target.value })} required /></label><label>Stock<input type="number" min="0" value={adminProduct.stock} onChange={(event) => setAdminProduct({ ...adminProduct, stock: event.target.value })} required /></label><label>Image URL<input value={adminProduct.image} onChange={(event) => setAdminProduct({ ...adminProduct, image: event.target.value })} />{adminProduct.image && <img className="image-preview" src={adminProduct.image} alt="New product preview" />}</label></div><button className="primary-button">Create demo product</button></form>}<div className="responsive-table"><table><thead><tr><th>Product</th><th>Category</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><img className="table-product-image" src={product.image || products[0]?.image} alt="" />{product.name}</td><td>{product.category}</td><td>{product.sku}</td><td>{formatCurrency(product.price)}</td><td className={product.stock < 5 ? "low-stock" : ""}>{product.stock}</td><td><button type="button" className="table-action" onClick={() => { const name = window.prompt("Update product name", product.name); if (name === null) return; const price = window.prompt("Update demo price", String(product.price)); if (price === null || !name.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) { notify("Product changes were not valid."); return; } setProducts((current) => current.map((item) => item.id === product.id ? { ...item, name: name.trim(), price: Number(price) } : item)); notify("Demo product updated."); }}>Edit</button><button type="button" className="table-action" onClick={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item))}>− stock</button><button type="button" className="table-action danger-action" onClick={() => { if (window.confirm(`Delete ${product.name} from this local demo?`)) setProducts((current) => current.filter((item) => item.id !== product.id)); }}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div></>}
    {section === "adminOrders" && <><div className="admin-toolbar"><label className="table-search">Search orders<input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Order ID or customer" /></label><button className="secondary-button" onClick={exportCsv}><Download size={15} /> Export CSV</button></div>{orders.filter((order) => order.id.toLowerCase().includes(adminSearch.toLowerCase()) || (order.customer?.email ?? "").toLowerCase().includes(adminSearch.toLowerCase())).map((order) => <article className="data-card admin-order-row" key={order.id}><div><b>{order.id}</b><small>{order.customer?.name ?? "Demo shopper"} · {new Date(order.date).toLocaleDateString()}</small></div><span className="status-chip">{order.status}</span><b>{formatCurrency(order.total)}</b><select value={order.status} aria-label={`Set ${order.id} demo status`} onChange={(event) => setOrders((current) => current.map((entry) => entry.id === order.id ? { ...entry, status: event.target.value } : entry))}>{["Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => <option key={status}>{status}</option>)}</select></article>)}</>}
    {section === "adminUsers" && <div className="data-card"><h2>Demo customer overview</h2><p>Customer accounts are local browser demo identities, not a real customer database.</p><div className="responsive-table"><table><thead><tr><th>Demo customer</th><th>Role</th><th>Orders</th><th>Account</th></tr></thead><tbody><tr><td>Current demo session</td><td>Frontend role: demonstration only</td><td>{orders.length}</td><td>Local browser</td></tr></tbody></table></div></div>}
    {section === "adminCategories" && <div className="data-card"><h2>Product departments</h2><form className="category-create-form" onSubmit={(event) => { event.preventDefault(); const category = newCategory.trim(); if (!category || categoryList.some((item) => item.toLowerCase() === category.toLowerCase())) { notify("Enter a unique category name."); return; } updateCategories([...categoryList, category]); setNewCategory(""); notify("Demo category saved locally."); }}><label htmlFor="new-category">Add department<input id="new-category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} maxLength={40} required /></label><button className="primary-button"><Plus size={15} /> Add category</button></form>{categoryList.map((category) => <div className="admin-category-row" key={category}><b>{category}</b><span>{products.filter((product) => product.category === category).length} products</span><button className="text-button" type="button" onClick={() => { if (products.some((product) => product.category === category) && !window.confirm("This department has products. Remove the category from the demo list?")) return; updateCategories(categoryList.filter((item) => item !== category)); }}>Remove</button></div>)}<p className="demo-disclaimer">Category edits are saved locally and do not change a backend catalog.</p></div>}
    {section === "adminInventory" && <div className="responsive-table"><table><thead><tr><th>Product</th><th>SKU</th><th>On hand</th><th>Stock status</th><th>Adjustment</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.sku}</td><td>{product.stock}</td><td><span className={product.stock < 5 ? "low-stock" : ""}>{product.stock < 5 ? "Low" : "Healthy"}</span></td><td><button className="table-action" onClick={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: item.stock + 1 } : item))}>+1</button><button className="table-action" disabled={!product.stock} onClick={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: item.stock - 1 } : item))}>−1</button></td></tr>)}</tbody></table></div>}
    {section === "adminCoupons" && <><form className="data-card form-card" onSubmit={addCoupon}><h2>Create demo coupon</h2><label>Coupon code<input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} maxLength={16} required /></label><label>Discount percent<input type="number" min="1" max="80" value={couponDiscount} onChange={(event) => setCouponDiscount(event.target.value)} required /></label><button className="primary-button">Save coupon</button></form>{coupons.map((coupon) => <div className="admin-category-row" key={coupon.code}><b>{coupon.code} · {coupon.discount}%</b><button className="text-button" onClick={() => setCoupons((current) => current.map((item) => item.code === coupon.code ? { ...item, active: !item.active } : item))}>{coupon.active ? "Deactivate" : "Activate"}</button></div>)}</>}
    {section === "adminReviews" && <div className="data-card"><h2>Review moderation</h2><p>There are {reviews.length} locally submitted demo reviews. Customer-created reviews appear under Account → Reviews.</p>{reviews.map((review) => <article className="review-card" key={review.id}><b>{review.rating} ★ · {review.author}</b><p>{review.text}</p><button className="text-button" type="button" onClick={() => notify("Review moderation is a frontend demonstration only.")}>Flag for review</button></article>)}<Link to="/profile/reviews">Open demo reviews <ArrowRight size={14} /></Link></div>}
    {section === "adminReports" && <><div className="stats-grid"><div><b>{formatCurrency(revenues)}</b><span>Demo order total</span></div><div><b>{orders.length}</b><span>Orders</span></div><div><b>{orders.filter((order) => order.status === "Delivered").length}</b><span>Delivered</span></div><div><b>{products.filter((product) => product.stock < 5).length}</b><span>Low stock</span></div></div><div className="data-card"><h2>Export</h2><p>Export only the demo order data stored in this browser.</p><button className="primary-button" onClick={exportCsv}><Download size={15} /> Download orders CSV</button></div></>}
  </section></div></main>;

}

export default WorkspacePage;
