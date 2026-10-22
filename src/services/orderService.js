import { readStorage, writeStorage } from "../utils/storage";
import { demoOrders } from "../utils/demoData";

const ORDERS_KEY = "nova-demo-orders";

export function getDemoOrders() {
  return readStorage(ORDERS_KEY, demoOrders);
}

export function saveDemoOrders(orders) {
  writeStorage(ORDERS_KEY, orders);
}
