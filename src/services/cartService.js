import { readStorage, writeStorage } from "../utils/storage";

const CART_KEY = "nova-demo-cart";

export function loadDemoCart() {
  return readStorage(CART_KEY, []);
}

export function saveDemoCart(items) {
  writeStorage(CART_KEY, items);
}

export function clearDemoCart() {
  saveDemoCart([]);
}
