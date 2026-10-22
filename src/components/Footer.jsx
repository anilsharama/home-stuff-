import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { readStorage, writeStorage } from "../utils/storage";

function Footer() {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    if (!email) return;
    const subscribers = readStorage("nova-demo-subscribers", []);
    if (!subscribers.includes(email)) writeStorage("nova-demo-subscribers", [...subscribers, email]);
    event.currentTarget.reset();
    window.dispatchEvent(new CustomEvent("nova-toast", { detail: "Demo signup saved on this device." }));
  }

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="wordmark footer-wordmark" href="/">nova<span>.</span></a>
          <p>A little better, every day.<br />Made for the life you really live.</p>
        </div>
        <div className="footer-links">
          <span className="footer-heading">HERE TO HELP</span>
          <Link to="/contact">Get in touch</Link>
          <Link to="/help">Shipping & returns</Link>
          <Link to="/help">A few FAQs</Link>
        </div>
        <div className="footer-links">
          <span className="footer-heading">THE NICE-TO-KNOWS</span>
          <Link to="/about">Our little way</Link>
          <Link to="/products">All the good things</Link>
          <Link to="/wishlist">Find your favorites</Link>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="footer-heading">A GOOD EMAIL, NOW & THEN</label>
          <p>Notes, new things, and the occasional little treat.</p>
          <div className="newsletter-input">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Your email address"
              required
            />
            <button aria-label="Sign up for our newsletter" type="submit">
              <ArrowRight size={17} />
            </button>
          </div>
          <span className="newsletter-note" role="status">Demo signup stored locally. No email is sent.</span>
        </form>
      </div>
      <div className="footer-bottom">
        <span>© 2025 NOVA GOODS CO. MADE WITH A LITTLE EXTRA CARE.</span>
        <div>
          <Link to="/help">Privacy</Link>
          <Link to="/help">Terms</Link>
          <span>GOOD THINGS, FROM EVERYWHERE.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
