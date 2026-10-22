# NOVA demo storefront

A frontend-only React + Vite e-commerce prototype. It runs without a backend. Products, demo customer preferences, cart contents, wishlists, demo orders, and admin edits are held in browser LocalStorage. No real account, email, payment, shipment, or refund is created.

## Requirements and start

- Node.js 20 or newer
- npm

```sh
npm install
npm run dev
```

The storefront opens at the Vite URL printed in the terminal. `npm run build` creates a production frontend bundle.

## Demo mode

Demo mode is the default and does not make backend requests. The sign-in screen offers a customer demo and an administrator demo. Demo passwords are never saved; LocalStorage contains only a clearly marked demo identity and non-sensitive storefront data. Choose **Explore admin demo** to view the sample administrative screens. All displayed order totals, payment options, inventory changes, coupons, and order status updates are demonstrations, not real transactions.

To clear demo data, remove the `nova-demo-*` keys from this site's LocalStorage.

## Future Spring Boot integration

`src/services/api.js` provides a centralized Axios client. Set `VITE_API_BASE_URL` to the Spring Boot API base URL (development default: `http://localhost:8080/api`). To opt into the product API adapter, set `VITE_DEMO_MODE=false`. The current demo pages intentionally continue using browser demo data unless their integration is implemented against the future API.

## Frontend organization

- `src/pages/` contains the home, catalog, product, account, order, support, and admin route pages.
- `src/components/` contains shared navigation, product cards, filters, cart/order summaries, address forms, timelines, and toast UI.
- `src/context/` provides demo authentication and shared storefront state.
- `src/data/` contains clearly separated demo products, departments, sample orders, addresses, and notifications.
- `src/utils/` contains browser storage and price calculation helpers.
- `src/services/` contains the Axios client and demo/future API adapters.

The existing Express server and its existing routes remain separate and unchanged. `npm run dev` starts only Vite, so the frontend does not require the Express server or a database. `npm run dev:fullstack` is available only for maintaining the existing Express API alongside Vite; the demo frontend does not depend on it.

## Safety and limitations

- The frontend's demo login and admin role selector are not security controls; real authentication and authorization must be enforced by Spring Boot.
- Frontend price, stock, shipping, and tax calculations are illustrative and must be recalculated by the backend before any real order.
- Payment choices are interface demonstrations only. No card details, security codes, UPI PINs, payment gateway credentials, or online transactions are collected.
- Password-reset and external notifications are not sent because no identity, email, SMS, payment, or shipping provider is configured.
