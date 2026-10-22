import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <span className="eyebrow"><span /> A LITTLE DETOUR</span>
      <h1>We can't find<br /><em>that page.</em></h1>
      <p>It may have moved on to something lovely. Let's get you back to the good things.</p>
      <Link className="hero-cta" to="/">
        <ArrowLeft size={16} /> Back to the shop
      </Link>
    </main>
  );
}

export default NotFoundPage;
