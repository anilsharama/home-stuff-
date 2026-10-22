import { categories } from "../data/categories";

function ProductFilters({ filters, onChange, brands }) {
  function set(name, value) {
    onChange({ ...filters, [name]: value, page: 1 });
  }
  return (
    <aside className="product-filters">
      <h2>Refine by</h2>
      <label>Category<select value={filters.category ?? ""} onChange={(event) => set("category", event.target.value)}><option value="">All departments</option>{categories.filter((category) => category.id !== "everything").map((category) => <option key={category.id}>{category.name}</option>)}</select></label>
      <label>Brand<select value={filters.brand ?? ""} onChange={(event) => set("brand", event.target.value)}><option value="">All brands</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
      <fieldset><legend>Price range</legend><div className="filter-range"><label><span className="sr-only">Minimum price</span><input type="number" min="0" placeholder="Min" value={filters.minPrice ?? ""} onChange={(event) => set("minPrice", event.target.value)} /></label><span>to</span><label><span className="sr-only">Maximum price</span><input type="number" min="0" placeholder="Max" value={filters.maxPrice ?? ""} onChange={(event) => set("maxPrice", event.target.value)} /></label></div></fieldset>
      <label>Rating<select value={filters.minRating ?? ""} onChange={(event) => set("minRating", event.target.value)}><option value="">Any rating</option><option value="4">4 stars & up</option><option value="4.5">4.5 stars & up</option></select></label>
      <label className="checkbox-filter"><input type="checkbox" checked={filters.inStock === "true"} onChange={(event) => set("inStock", event.target.checked ? "true" : "")} /> In stock only</label>
      <button className="filter-reset" type="button" onClick={() => onChange({ page: 1, pageSize: 8 })}>Clear all</button>
    </aside>
  );
}

export default ProductFilters;
