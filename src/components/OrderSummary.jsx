import { formatCurrency } from "../utils/currency";

function OrderSummary({ summary, title = "Order summary" }) {
  return (
    <aside className="order-summary">
      <h2>{title}</h2>
      <div><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
      {summary.discount > 0 && <div className="discount-row"><span>Demo coupon</span><span>−{formatCurrency(summary.discount)}</span></div>}
      <div><span>Shipping</span><span>{summary.shipping === 0 ? "FREE" : formatCurrency(summary.shipping)}</span></div>
      <div><span>Estimated tax</span><span>{formatCurrency(summary.tax)}</span></div>
      <div className="summary-total"><strong>Estimated total</strong><strong>{formatCurrency(summary.total)}</strong></div>
      <small>Demonstration estimate only. Final charges are not processed.</small>
    </aside>
  );
}

export default OrderSummary;
