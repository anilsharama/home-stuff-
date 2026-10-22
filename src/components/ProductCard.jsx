import { Heart, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { products as catalogProducts } from "../data/products";
import { formatCurrency } from "../utils/currency";

function ProductCard({ product, onNotice = () => {} }) {
  const { wishlist, toggleWishlist, addToCart, addRecentlyViewed } = useStore();
  const saved = wishlist.includes(product.id);
  const image = product.image || catalogProducts[0].image;

  function add() {
    const added = addToCart(product);
    onNotice(added ? `${product.name} added to your bag.` : "This item is currently out of stock.");
  }

  return (
    <article className="shop-product-card">
      <div className="shop-product-image">
        <Link to={`/products/${product.id}`} onClick={() => addRecentlyViewed(product.id)} aria-label={`View ${product.name}`}>
          <img src={image} alt={product.name} loading="lazy" />
        </Link>
        {product.badge && <span className="shop-product-badge">{product.badge}</span>}
        <button className={`wishlist-toggle${saved ? " is-saved" : ""}`} type="button" aria-label={`${saved ? "Remove from" : "Add to"} wishlist`} aria-pressed={saved} onClick={() => { toggleWishlist(product.id); onNotice(saved ? "Removed from your wishlist." : "Saved to your wishlist."); }}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="shop-product-info">
        <span className="shop-product-category">{product.category} · {product.brand}</span>
        <Link to={`/products/${product.id}`} onClick={() => addRecentlyViewed(product.id)} className="shop-product-name">{product.name}</Link>
        <div className="shop-rating"><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></div>
        <div className="shop-price">{formatCurrency(product.price)} {product.originalPrice && <del>{formatCurrency(product.originalPrice)}</del>}</div>
        <div className={`stock-copy${product.stock < 5 ? " low-stock" : ""}`}>{product.stock > 0 ? product.stock < 5 ? `Only ${product.stock} left` : "In stock" : "Out of stock"}</div>
        <button className="add-bag-button" type="button" disabled={product.stock < 1} onClick={add}><Plus size={15} /> Add to bag</button>
      </div>
    </article>
  );
}

export default ProductCard;
