# ShopCart — TypeScript Learning Project

A small full-stack storefront app used as a hands-on TypeScript/React/Node
onboarding exercise: landing/auth page, product catalog, and a cart, backed by
a custom BFF (Backend-for-Frontend) server that proxies
[DummyJSON](https://dummyjson.com) and owns its own cart persistence.

## Repo structure

```
app/
  client/   React + TypeScript + Vite frontend
  server/   Node + TypeScript + Express backend (BFF)
```

- [client/README.md](client/README.md) — frontend setup and architecture
- [HANDOFF.md](HANDOFF.md) — full project context, decisions, and lessons learned (for onboarding a new contributor or AI session)

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
running — the server needs `PORT`, `THIRD_PARTY_BASE_URL`, `CLIENT_ORIGIN`;
the client needs `VITE_API_BASE_URL`.

## What it does

- Sign in / sign up (proxied through the server to DummyJSON auth)
- Browse a product catalog with pagination and product detail pages
- Add/update/remove items in a cart that's persisted server-side per user
  (not just in-memory in the browser)

## Stack

- **Client:** React 19, TypeScript, Vite, React Router
- **Server:** Node.js, TypeScript, Express 5

See [HANDOFF.md](HANDOFF.md) for the full architecture breakdown, key design
decisions, and lessons learned while building this.
