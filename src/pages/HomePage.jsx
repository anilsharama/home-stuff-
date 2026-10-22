import { useMemo, useState } from "react";
import { ArrowRight, Heart, Leaf, ShieldCheck, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

function HomePage() {
  const { products, recentlyViewed } = useStore();
  const [notice, setNotice] = useState("");
  const featured = products.slice(0, 8);
  const viewed = useMemo(
    () => recentlyViewed.map((id) => products.find((product) => product.id === id)).filter(Boolean),
    [products, recentlyViewed],
  );

  return (
    <main className="home-page">
      <section className="home-hero">
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90" alt="Warm, light-filled contemporary living room" />
        <div className="home-hero-copy">
          <span className="eyebrow">A SOFTER KIND OF EVERYDAY</span>
          <h1>Make room for<br />the <em>good stuff.</em></h1>
          <p>Thoughtful things for your space, your rituals, and all the lovely little in-between.</p>
          <Link className="primary-button" to="/products">Shop the collection <ArrowRight size={17} /></Link>
        </div>
        <span className="hero-caption">THE SLOW LIVING COLLECTION · NO. 08</span>
      </section>

      <section className="service-promises">
        <div><Leaf /><span><b>Thoughtfully made</b><small>Considered materials, always</small></span></div>
        <div><Truck /><span><b>Free delivery over $75</b><small>A little extra reason to browse</small></span></div>
        <div><ShieldCheck /><span><b>30-day easy returns</b><small>Take your time deciding</small></span></div>
      </section>

      <section className="catalog-section">
        <div className="section-title-row"><div><span className="eyebrow">GOOD THINGS, GATHERED</span><h2>Find your everyday <em>favorite.</em></h2><p>The little things that make a day feel more like yours.</p></div><Link className="subtle-link" to="/products">Shop all <ArrowRight size={16} /></Link></div>
        <div className="product-grid">{featured.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} onNotice={setNotice} />)}</div>
      </section>

      <section className="home-promo">
        <div><span className="eyebrow">A SMALLER FOOTPRINT, A FULLER HEART</span><h2>Good for your home.<br /><em>A little kinder to ours.</em></h2><p>Thoughtful materials, responsible partners, and less packaging. Not perfect — just doing a little better, every day.</p><Link className="subtle-link" to="/about">Get to know our way <ArrowRight size={16} /></Link></div>
        <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85" alt="Calm living room with natural materials" loading="lazy" />
      </section>

      <section className="catalog-section">
        <div className="section-title-row"><div><span className="eyebrow">A LITTLE LOVE FROM OUR CUSTOMERS</span><h2>Good things, <em>well loved.</em></h2></div><Link className="subtle-link" to="/products?sort=rating">Top rated <Star size={15} /></Link></div>
        <div className="product-grid">{featured.slice(4, 8).map((product) => <ProductCard key={product.id} product={product} onNotice={setNotice} />)}</div>
      </section>

      {viewed.length > 0 && <section className="catalog-section"><div className="section-title-row"><div><span className="eyebrow">PICKING UP WHERE YOU LEFT OFF</span><h2>Recently <em>visited.</em></h2></div><Link className="subtle-link" to="/recently-viewed">See all <ArrowRight size={16} /></Link></div><div className="product-grid">{viewed.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} onNotice={setNotice} />)}</div></section>}

      {notice && <div className="toast-message" role="status"><Heart size={15} /> {notice}<button type="button" onClick={() => setNotice("")}>×</button></div>}
    </main>
  );
}

export default HomePage;
