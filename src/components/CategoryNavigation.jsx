import { Link } from "react-router-dom";
import { categories } from "../data/categories";

function CategoryNavigation() {
  return <nav className="category-nav" aria-label="Browse departments">{categories.filter((item) => item.id !== "everything").map((item) => <Link key={item.id} to={`/category/${encodeURIComponent(item.id)}`}>{item.icon} {item.name}</Link>)}</nav>;
}

export default CategoryNavigation;
