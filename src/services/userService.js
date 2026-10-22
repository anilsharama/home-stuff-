import { readStorage, writeStorage } from "../utils/storage";
import { demoAddresses } from "../utils/demoData";

const ADDRESSES_KEY = "nova-demo-addresses";

export function getDemoAddresses() {
  return readStorage(ADDRESSES_KEY, demoAddresses);
}

export function saveDemoAddresses(addresses) {
  writeStorage(ADDRESSES_KEY, addresses);
}
