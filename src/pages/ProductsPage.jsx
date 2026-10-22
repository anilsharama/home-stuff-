import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Pagination from "../components/Pagination";
import { useStore } from "../context/StoreContext";

function ProductsPage({ mode = "all" }) {
  const { products } = useStore();
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const { categoryId } = useParams();
  const category = mode === "category" ? decodeURIComponent(categoryId ?? "") : "";
  const [filters, setFilters] = useState({ category, page: 1, pageSize: 8, sort: "featured" });
  useEffect(() => {
    setFilters((current) => ({ ...current, category, page: 1 }));
  }, [category]);
  const brands = useMemo(() => [...new Set(products.map((product) => product.brand))].sort(), [products]);
  const result = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    let values = products.filter((product) => {
      const matchQuery = !term || `${product.name} ${product.brand} ${product.category} ${product.description}`.toLocaleLowerCase().includes(term);
      const matchCategory = !filters.category || filters.category === "everything" || product.category.toLowerCase() === filters.category.toLowerCase();
      const matchBrand = !filters.brand || product.brand === filters.brand;
      const matchPrice = (!filters.minPrice || product.price >= Number(filters.minPrice)) && (!filters.maxPrice || product.price <= Number(filters.maxPrice));
      const matchRating = !filters.minRating || product.rating >= Number(filters.minRating);
      const matchStock = filters.inStock !== "true" || product.stock > 0;
      return matchQuery && matchCategory && matchBrand && matchPrice && matchRating && matchStock;
    });
    if (filters.sort === "price-asc") values = [...values].sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") values = [...values].sort((a, b) => b.price - a.price);
    if (filters.sort === "rating") values = [...values].sort((a, b) => b.rating - a.rating);
    if (filters.sort === "popularity") values = [...values].sort((a, b) => b.reviews - a.reviews);
    if (filters.sort === "newest") values = [...values].reverse();
    const pages = Math.max(1, Math.ceil(values.length / filters.pageSize));
    return { values: values.slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize), total: values.length, pages };
  }, [filters, products, query]);
  const heading = mode === "category" ? category : mode === "search" ? `Search results for “${query}”` : "Shop all good things";
  return (
    <main className="content-page catalog-page">
      <div className="breadcrumb"><a href="/">Home</a><span>/</span><span>{heading}</span></div>
      <div className="page-heading"><div><span className="eyebrow">{mode === "search" ? "FIND YOUR FAVORITE" : "THOUGHTFULLY GATHERED"}</span><h1>{heading}</h1><p>{result.total} thoughtfully selected things</p></div><label className="sort-select">Sort by <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value, page: 1 })}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="popularity">Popularity</option><option value="rating">Customer rating</option><option value="newest">Newest arrivals</option></select></label></div>
      <div className="catalog-layout"><ProductFilters filters={filters} onChange={setFilters} brands={brands} /><section><div className="catalog-grid">{result.values.map((product) => <ProductCard key={product.id} product={product} />)}</div>{result.total === 0 && <div className="empty-panel"><h2>No good things found just yet.</h2><p>Try widening your filters or another search.</p></div>}<Pagination page={filters.page} pages={result.pages} onChange={(page) => setFilters({ ...filters, page })} /></section></div>
    </main>
  );
}

export default ProductsPage;
