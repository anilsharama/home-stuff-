import { useState } from "react";
import { Heart, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "../data/categories";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, signOut } = useAuth();
  const { cart, wishlist } = useStore();
  const navigate = useNavigate();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  function search(event) {
    event.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/products");
    setMenuOpen(false);
  }

  return (
    <>
      <div className="announcement"><span>✦</span> The thoughtful edit for your everyday <span>·</span> Free shipping over $75</div>
      <header className="store-header">
        <button className="store-icon mobile-nav-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Link className="store-logo" to="/" aria-label="NOVA home">nova<span>.</span></Link>
        <form className="store-search" onSubmit={search}>
          <label className="sr-only" htmlFor="site-search">Search products</label>
          <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search good things..." />
          <button type="submit" aria-label="Search"><Search size={19} /></button>
        </form>
        <nav className="store-actions" aria-label="Account and shopping">
          <Link to={user ? "/profile" : "/login"} className="store-action"><UserRound size={19} /><span>{user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in"}</span></Link>
          {user && <button className="store-action signout-action" type="button" onClick={signOut} aria-label="Sign out of demo account"><LogOut size={16} /></button>}
          <Link to="/wishlist" className="store-action store-heart" aria-label={`Wishlist, ${wishlist.length} saved`}><Heart size={19} /><span>{wishlist.length}</span></Link>
          <Link to="/cart" className="store-action" aria-label={`Cart, ${cartCount} items`}><ShoppingBag size={20} /><span>Cart</span><b>{cartCount}</b></Link>
        </nav>
      </header>
      <div className={`category-nav${menuOpen ? " category-nav-open" : ""}`}>
        <nav aria-label="Product categories">
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop all</Link>
          {categories.filter((category) => category.id !== "everything").map((category) => (
            <Link key={category.id} to={`/category/${encodeURIComponent(category.id)}`} onClick={() => setMenuOpen(false)}>{category.name}</Link>
          ))}
          <Link to="/orders" onClick={() => setMenuOpen(false)}>Your orders</Link>
          <Link to="/help" onClick={() => setMenuOpen(false)}>Help</Link>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
