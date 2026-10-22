import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "./catalog.ts";

type OrderInput = {
  customer: { name: string; email: string };
  items: { productId: string; quantity: number }[];
};

type Order = OrderInput & {
  id: string;
  total: number;
  createdAt: string;
};

const app = express();
const port = Number(process.env.PORT) || 3001;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.join(projectRoot, "server", "data");
const ordersFile = path.join(dataDirectory, "orders.json");
const subscribersFile = path.join(dataDirectory, "subscribers.json");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https://images.unsplash.com"],
        "style-src": ["'self'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

let orders: Order[] = [];
let subscribers: string[] = [];
let writeQueue = Promise.resolve();

async function readStoredArray<T>(file: string, description: string): Promise<T[]> {
  try {
    const content = await readFile(file, "utf8");
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error(`The stored ${description} file must contain a JSON array.`);
    }
    return parsed as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    return [];
  }
}

async function loadData(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  [orders, subscribers] = await Promise.all([
    readStoredArray<Order>(ordersFile, "orders"),
    readStoredArray<string>(subscribersFile, "subscribers"),
  ]);
}

function persistOrder(order: Order): Promise<void> {
  const operation = writeQueue.then(async () => {
    const nextOrders = [...orders, order];
    const temporaryFile = `${ordersFile}.${randomUUID()}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(nextOrders, null, 2)}\n`, "utf8");
    await rename(temporaryFile, ordersFile);
    orders = nextOrders;
  });
  writeQueue = operation.catch(() => undefined);
  return operation;
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/products", (request, response) => {
  const query = String(request.query.q ?? "").trim().toLocaleLowerCase();
  const category = String(request.query.category ?? "").trim().toLocaleLowerCase();
  const sort = request.query.sort;

  const result = products
    .filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        `${product.name} ${product.category} ${product.description}`
          .toLocaleLowerCase()
          .includes(query);
      const matchesCategory =
        category.length === 0 || product.category.toLocaleLowerCase() === category;
      return matchesQuery && matchesCategory;
    })
    .sort((first, second) => {
      if (sort === "price-asc") return first.price - second.price;
      if (sort === "price-desc") return second.price - first.price;
      if (sort === "rating") return second.rating - first.rating;
      return 0;
    });

  response.json({ data: result, total: result.length });
});

app.post("/api/orders", async (request, response, next) => {
  try {
    const body: unknown = request.body;
    if (typeof body !== "object" || body === null) {
      response.status(400).json({ error: "A valid order is required." });
      return;
    }

    const input = body as Partial<OrderInput>;
    const customer = input.customer;
    const items = input.items;
    if (
      typeof customer !== "object" ||
      customer === null ||
      typeof customer.name !== "string" ||
      customer.name.trim().length < 2 ||
      customer.name.trim().length > 100 ||
      typeof customer.email !== "string" ||
      customer.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    ) {
      response.status(400).json({ error: "Enter a valid name and email address." });
      return;
    }
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50 ||
      !items.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.productId === "string" &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= 99,
      )
    ) {
      response.status(400).json({ error: "Your order must include valid items." });
      return;
    }

    const quantities = new Map<string, number>();
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    if ([...quantities.values()].some((quantity) => quantity > 99)) {
      response.status(400).json({ error: "The quantity for an item cannot exceed 99." });
      return;
    }

    const normalizedItems = [...quantities].map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
    const total = normalizedItems.reduce((sum, item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    if (normalizedItems.some((item) => !products.some((product) => product.id === item.productId))) {
      response.status(400).json({ error: "One or more products are no longer available." });
      return;
    }

    const order: Order = {
      id: randomUUID(),
      customer: { name: customer.name.trim(), email: customer.email.trim().toLowerCase() },
      items: normalizedItems,
      total,
      createdAt: new Date().toISOString(),
    };
    await persistOrder(order);
    response.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
});

app.post("/api/newsletter", async (request, response, next) => {
  try {
    const email =
      typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      response.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    const operation = writeQueue.then(async () => {
      if (subscribers.includes(email)) return;
      const nextSubscribers = [...subscribers, email];
      const temporaryFile = `${subscribersFile}.${randomUUID()}.tmp`;
      await writeFile(temporaryFile, `${JSON.stringify(nextSubscribers, null, 2)}\n`, "utf8");
      await rename(temporaryFile, subscribersFile);
      subscribers = nextSubscribers;
    });
    writeQueue = operation.catch(() => undefined);
    await operation;
    response.status(201).json({ message: "You're on the list. Thanks for being here!" });
  } catch (error) {
    next(error);
  }
});

if (process.env.NODE_ENV === "production") {
  const buildDirectory = path.join(projectRoot, "dist");
  app.use(express.static(buildDirectory));
  app.get("/{*path}", (_request, response) => {
    response.sendFile(path.join(buildDirectory, "index.html"));
  });
}

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "The request body must contain valid JSON." });
    return;
  }
  console.error("Request failed:", error);
  response.status(500).json({ error: "Something went wrong. Please try again." });
};
app.use(errorHandler);

await loadData();
app.listen(port, () => {
  console.info(`NOVA API is listening on http://localhost:${port}`);
});
