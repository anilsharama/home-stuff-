const storageKey = "nova-demo-user";

export async function signInDemo({ email, name, role = "customer" }) {
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  const user = {
    id: role === "admin" ? "demo-admin" : `demo-${email.toLowerCase()}`,
    name: name.trim() || (role === "admin" ? "NOVA Demo Admin" : "NOVA Shopper"),
    email: email.trim().toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
    demo: true,
  };
  localStorage.setItem(storageKey, JSON.stringify(user));
  return user;
}

export function getDemoUser() {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return null;
    const user = JSON.parse(value);
    if (!user?.demo || typeof user.email !== "string" || !["customer", "admin"].includes(user.role)) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function clearDemoUser() {
  localStorage.removeItem(storageKey);
}
