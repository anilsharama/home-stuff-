import api from "./api";
import { products as demoProducts } from "../data/products";

const demoMode = import.meta.env.VITE_DEMO_MODE !== "false";

export async function getProducts(filters = {}) {
  if (!demoMode) {
    const { data } = await api.get("/products", { params: filters });
    return Array.isArray(data) ? data : data.data;
  }
  await new Promise((resolve) => window.setTimeout(resolve, 120));
  const query = String(filters.q ?? "").trim().toLocaleLowerCase();
  let result = demoProducts.filter((product) => {
    const matchesQuery =
      !query ||
      `${product.name} ${product.category} ${product.brand} ${product.description} ${product.sku}`
        .toLocaleLowerCase()
        .includes(query);
    const matchesCategory =
      !filters.category ||
      filters.category === "everything" ||
      product.category.toLocaleLowerCase() === String(filters.category).toLocaleLowerCase();
    const matchesBrand =
      !filters.brand || product.brand.toLocaleLowerCase() === String(filters.brand).toLocaleLowerCase();
    const matchesPrice =
      (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || product.price <= Number(filters.maxPrice));
    const matchesRating = !filters.minRating || product.rating >= Number(filters.minRating);
    const matchesStock = filters.inStock !== "true" || product.stock > 0;
    return matchesQuery && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock;
  });
  if (filters.sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
  if (filters.sort === "rating" || filters.sort === "popularity") result = [...result].sort((a, b) => b.rating - a.rating);
  if (filters.sort === "newest") result = [...result].reverse();
  const pageSize = Number(filters.pageSize) || result.length || 1;
  const page = Number(filters.page) || 1;
  return {
    data: result.slice((page - 1) * pageSize, page * pageSize),
    total: result.length,
    page,
    pageSize,
    pages: Math.ceil(result.length / pageSize),
  };
}

export async function getProduct(productId) {
  if (!demoMode) {
    const { data } = await api.get(`/products/${encodeURIComponent(productId)}`);
    return data.data ?? data;
  }
  return demoProducts.find((product) => product.id === productId) ?? null;
}

export { demoMode };
