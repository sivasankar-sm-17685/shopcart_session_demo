# ShopCart — TypeScript Learning Project

A small full-stack storefront used as a hands-on TypeScript/React/Node
onboarding exercise: landing/auth page, product catalog, and a cart.

The server is a BFF (Backend-for-Frontend). It proxies product data from
[DummyJSON](https://dummyjson.com) and owns accounts, sessions, and carts
itself. Sign-in sets an HttpOnly `session` cookie. The browser sends that
cookie on later requests. JavaScript never sees the session token.

## Repo structure

```
app/
  client/   React + TypeScript + Vite frontend
  server/   Node + TypeScript + Express backend (BFF)
```

- [client/README.md](client/README.md) — frontend setup and architecture
- [server/README.md](server/README.md) — server setup, and how to view or clear the database
- [HANDOFF.md](HANDOFF.md) — decisions and lessons from building this (for a new contributor or AI session)

## Quick start

Run both apps in separate terminals:

```bash
# Terminal 1 — server (http://localhost:4000)
cd server
npm install
npm run dev

# Terminal 2 — client (http://localhost:5173)
cd client
npm install
npm run dev
```

Both need a local `.env` file (see `.env.example` in each folder) before
running.

- Server: `PORT`, `THIRD_PARTY_BASE_URL`, `CLIENT_ORIGIN`
- Client: `VITE_API_BASE_URL` (must start with `VITE_` or Vite drops it)

## What it does

- Sign up and sign in against the server's own user store (SQLite)
- Stay signed in across a refresh. The client asks `GET /api/auth/me` on load
- Browse a product catalog with pagination and product detail pages
- Add, update, and remove cart items. The cart is stored on the server per user, and the session cookie says whose cart it is

## Stack

- **Client:** React 19, TypeScript, Vite, React Router
- **Server:** Node.js, TypeScript, Express 5, SQLite (`better-sqlite3`)

See [HANDOFF.md](HANDOFF.md) for the architecture, the design decisions, and the lessons from building this.
