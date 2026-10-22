export const demoOrders = [
  {
    id: "NOVA-10482",
    date: "2026-10-18T10:35:00.000Z",
    status: "Shipped",
    paymentMethod: "Cash on delivery",
    paymentStatus: "Demo — due on delivery",
    items: [{ productId: "ceramic-set", quantity: 1 }, { productId: "daily-journal", quantity: 2 }],
    subtotal: 96,
    discount: 9.6,
    shipping: 0,
    tax: 6.91,
    total: 93.31,
    demo: true,
  },
  {
    id: "NOVA-10307",
    date: "2026-09-29T14:20:00.000Z",
    status: "Delivered",
    paymentMethod: "Online payment (demo)",
    paymentStatus: "Demo payment — not charged",
    items: [{ productId: "glass-bottle", quantity: 1 }],
    subtotal: 38,
    discount: 0,
    shipping: 6.95,
    tax: 3.04,
    total: 47.99,
    demo: true,
  },
];

export const demoAddresses = [
  { id: "home", name: "Rohit Sharma", phone: "+1 (555) 010-2026", line1: "214 Willow Street", line2: "Apartment 4B", city: "Portland", state: "Oregon", postalCode: "97205", country: "United States", isDefault: true },
];

export const demoNotifications = [
  { id: "delivery-1", title: "A little update on your order", message: "Order NOVA-10482 is on its way.", date: "2026-10-20T09:00:00.000Z", read: false },
  { id: "welcome-1", title: "Welcome to NOVA", message: "Good things are just around the corner.", date: "2026-10-12T12:00:00.000Z", read: true },
];
