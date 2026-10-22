import { ArrowLeft, ArrowRight } from "lucide-react";

function Pagination({ page, pages, onChange }) {
  if (pages < 2) return null;
  return (
    <nav className="pagination" aria-label="Product pages">
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ArrowLeft size={15} /> Previous</button>
      {Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button type="button" key={number} aria-current={number === page ? "page" : undefined} className={number === page ? "page-active" : ""} onClick={() => onChange(number)}>{number}</button>)}
      <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next <ArrowRight size={15} /></button>
    </nav>
  );
}

export default Pagination;
