const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return formatter.format(Number(amount) || 0);
}

export function calculateCart(items, coupon = "", couponDiscount = 10) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = coupon ? subtotal * (couponDiscount / 100) : 0;
  const shipping = subtotal - discount >= 75 || subtotal === 0 ? 0 : 6.95;
  const tax = (subtotal - discount) * 0.08;
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: subtotal - discount + shipping + tax,
  };
}
