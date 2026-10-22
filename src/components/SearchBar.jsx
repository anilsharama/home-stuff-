import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({ initialValue = "" }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();
  function submit(event) {
    event.preventDefault();
    navigate(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/products");
  }
  return <form className="store-search" role="search" onSubmit={submit}><label className="sr-only" htmlFor="search-bar">Search products</label><input id="search-bar" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search by product, brand, or category" /><button type="submit" aria-label="Search"><Search size={18} /></button></form>;
}

export default SearchBar;
