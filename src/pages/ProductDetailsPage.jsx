import { useEffect, useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/currency";

function ProductDetailsPage() {
  const { productId } = useParams();
  const { products, addToCart, wishlist, toggleWishlist, addRecentlyViewed } = useStore();
  const product = products.find((item) => item.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState(product?.colors?.[0] ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      setImage(product.image);
      setVariant(product.colors?.[0] ?? "");
    }
  }, [product?.id]);

  if (!product) return <main className="content-page empty-panel"><h1>That item wandered off.</h1><Link className="primary-button" to="/products">Browse the collection</Link></main>;
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <main className="content-page">
      <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><Link to={`/category/${product.category}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div>
      <section className="product-detail-layout">
        <div className="product-gallery"><div className="product-main-image"><img src={image} alt={product.name} /></div><div className="gallery-thumbs"><button type="button" aria-label="View product image" onClick={() => setImage(product.image)}><img src={product.image} alt="" /></button><span>Images supplied for this demo listing</span></div></div>
        <div className="product-detail-copy"><span className="eyebrow">{product.brand} · {product.sku}</span><h1>{product.name}</h1><div className="detail-rating"><Star size={16} fill="currentColor" /> {product.rating} <a href="#reviews">({product.reviews} customer reviews)</a></div><p className="detail-price">{formatCurrency(product.price)} {product.originalPrice && <del>{formatCurrency(product.originalPrice)}</del>}</p><span className={`stock-copy${product.stock < 5 ? " low-stock" : ""}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span><p className="detail-description">{product.description}</p>
          <dl className="specifications">{Object.entries(product.specifications ?? {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
          {product.colors?.length > 0 && <label className="variant-select">Color / style<select value={variant} onChange={(event) => setVariant(event.target.value)}>{product.colors.map((color) => <option key={color}>{color}</option>)}</select></label>}
          <div className="detail-buy-row"><div className="quantity-stepper"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div><button className="primary-button" type="button" disabled={!product.stock} onClick={() => { addToCart(product, quantity, variant); setMessage("Added to your demo bag."); }}><ShoppingBag size={17} /> Add to cart</button><button className={`icon-outline${wishlist.includes(product.id) ? " is-saved" : ""}`} type="button" aria-label="Toggle wishlist" onClick={() => toggleWishlist(product.id)}><Heart size={18} fill={wishlist.includes(product.id) ? "currentColor" : "none"} /></button></div>
          {message && <p className="inline-success" role="status">{message}</p>}<div className="delivery-note"><Truck size={17} /> Free delivery on demo orders over $75</div><div className="delivery-note"><ShieldCheck size={17} /> Demo item; stock and price are for display only</div>
        </div>
      </section>
      <section id="reviews" className="detail-reviews"><span className="eyebrow">CUSTOMER NOTES</span><h2>Loved by our customers</h2><p><Star size={15} fill="currentColor" /> {product.rating} out of 5 · {product.reviews} demo reviews</p><Link to="/profile/reviews">Write a demo review</Link></section>
      {related.length > 0 && <section className="catalog-section detail-related"><h2>You might also <em>like.</em></h2><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}

export default ProductDetailsPage;
