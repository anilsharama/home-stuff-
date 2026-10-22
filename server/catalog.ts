export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  rating: number;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "ceramic-set",
    name: "Sunday ceramic set",
    category: "Home",
    price: 48,
    originalPrice: 60,
    description: "Slow mornings start here.",
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=85",
    rating: 4.9,
    badge: "Bestseller",
  },
  {
    id: "everyday-tote",
    name: "Everyday canvas tote",
    category: "Accessories",
    price: 32,
    description: "Room for your kind of day.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
    rating: 4.8,
    badge: "Almost gone",
  },
  {
    id: "linen-throw",
    name: "Soft linen throw",
    category: "Home",
    price: 86,
    originalPrice: 108,
    description: "A softer place to land.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    rating: 4.9,
    badge: "Made to last",
  },
  {
    id: "daily-journal",
    name: "The daily journal",
    category: "Stationery",
    price: 24,
    description: "A little space to think.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85",
    rating: 4.7,
  },
  {
    id: "glass-bottle",
    name: "Daylight glass bottle",
    category: "Wellness",
    price: 38,
    description: "Good things, refillable.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    rating: 4.8,
    badge: "Just landed",
  },
  {
    id: "market-bag",
    name: "Market day carryall",
    category: "Accessories",
    price: 42,
    description: "Made for the long way home.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85",
    rating: 4.6,
  },
  {
    id: "stoneware-vase",
    name: "Hand-finished stoneware",
    category: "Home",
    price: 54,
    description: "A quiet little statement.",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85",
    rating: 4.9,
  },
  {
    id: "morning-candle",
    name: "First light candle",
    category: "Wellness",
    price: 29,
    description: "Cedar, citrus & a fresh start.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85",
    rating: 4.8,
    badge: "Staff pick",
  },
];
