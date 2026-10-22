import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/currency";

function CartItem({ item, onQuantity, onRemove }) {
  return (
    <article className="cart-line">
      <img src={item.product.image} alt={item.product.name} />
      <div className="cart-line-info"><a href={`/products/${item.product.id}`}>{item.product.name}</a><small>{item.product.category}{item.variant ? ` · ${item.variant}` : ""}</small><span className="stock-copy">{item.product.stock > 0 ? "In stock" : "Out of stock"}</span>
        <div className="quantity-stepper"><button type="button" aria-label="Decrease quantity" onClick={() => onQuantity(item, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" aria-label="Increase quantity" disabled={item.quantity >= item.product.stock} onClick={() => onQuantity(item, item.quantity + 1)}><Plus size={13} /></button></div>
      </div>
      <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
      <button className="remove-cart-line" type="button" aria-label={`Remove ${item.product.name}`} onClick={() => onRemove(item)}><Trash2 size={16} /></button>
    </article>
  );
}

export default CartItem;
