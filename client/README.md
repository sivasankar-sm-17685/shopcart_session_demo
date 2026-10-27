A React + TypeScript storefront demo — a landing/auth page, a product catalog,
and a cart — built incrementally as a TypeScript learning project, and
intended as an onboarding reference for the team.

The client talks only to the ShopCart server (`VITE_API_BASE_URL`). Products
are proxied from [DummyJSON](https://dummyjson.com/) by that server. Accounts
and the cart live on the server. Sign-in stores an HttpOnly `session` cookie.
The client never reads the token.

### Requirements

- Node.js 18.18 or newer (Node 18.20.8 is specified in `.nvmrc`).
- npm 8 or newer (verified with npm 8.19.4).

Node 18 and npm 8 are legacy versions; use a supported Node.js release for new
deployments when possible.

### Getting started

```sh
nvm use # optional, if nvm is installed
npm ci
npm run dev
```

Copy `.env.example` to `.env` first. Vite only exposes variables that start
with `VITE_`, and it reads `.env` at startup, so restart the dev server after
changing it.

Open the local URL printed by Vite (usually http://localhost:5173). The API
must already be running (see the server README).

### Available commands

- `npm run dev`: start the development server.
- `npm run lint`: check the source with ESLint.
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run preview`: serve the production build locally after building.

The committed npm lockfile uses the npm 8-compatible format. Dependencies and
build output are excluded from version control.

## Features

- **Landing / Sign in / Sign up** (`/`) — sign in and sign up share one form,
  switching via a typed `AuthMode` union (`'signin' | 'signup'`). Both call
  the server (`POST /api/auth/signin`, `POST /api/auth/signup`). A successful
  sign-up signs the user in and goes to `/products`, because the server sets
  the session cookie on sign-up too. A visitor who is already signed in is
  redirected to `/products`.
- **Product list** (`/products`) — `GET /api/products`, rendered as a grid
  with loading and error states.
- **Product detail** (`/products/:id`) — one product, an image gallery,
  discount pricing, stock status, and warranty/shipping/returns. Add to cart
  and the quantity stepper call the server cart.
- **Cart** (`/cart`) — add, remove, change quantity, and clear. A shared
  `QuantityStepper` is used on the detail page and the cart page. The server
  decides whose cart it is from the session cookie.
- **Auth-gated routing** — `/products`, `/products/:id`, and `/cart` sit under
  one `ProtectedRoute`. While `GET /api/auth/me` is still in flight the route
  shows a loader, so a refresh does not bounce a signed-in user to `/`.
- **Toasts** — success and failure notices with a close button and a
  3-second auto-dismiss timer.

## Architecture

The codebase is organized by responsibility rather than by page, so each layer
only knows about the one below it:

```
src/
  api/          Plain fetch wrappers — no React, no state. One function per
                endpoint (loginUser, getMe, getProducts, getCart, …).
                Auth and cart calls send credentials: 'include' so the
                browser attaches the session cookie. Product calls do not.
  types/        Shared TypeScript types — interfaces for API response shapes,
                and type unions such as AuthMode.
  utils/        Pure helpers with no React (form validation).
  context/      React Context for state shared across the tree (auth and
                cart). Split into three files per Context to keep Vite's
                fast-refresh happy:
                  - <name>ContextInstance.ts — the createContext() call only
                  - <Name>Context.tsx        — the *Provider component only
                  - use<Name>.ts             — the consumer hook only
  hooks/        Custom hooks that own component-level state and orchestrate
                calls into api/ and context/ (e.g. useAuthForm, useProducts).
  providers/    Composition root for app-wide providers (AppProviders), kept
                separate from main.tsx so adding a new provider never requires
                touching the bootstrap file.
  components/   Reusable, presentational UI with no feature-specific logic
                (FormField, QuantityStepper, Toast, NavBar, ProtectedRoute).
  features/     Page-level components that compose hooks + components for one
                specific feature (features/auth, features/Products, features/Cart).
  App.tsx       Route definitions only.
  main.tsx      Bootstraps React, the router, and AppProviders. Nothing else.
```

### Why it's organized this way

- **Single Responsibility** — `authApi.ts` only knows how to call the auth
  endpoints; `validation.ts` only knows validation rules; `useAuthForm`
  orchestrates state and calls the other two; `AuthForm`/`AuthCard` only
  render UI. Each piece can change independently.
- **Dependency Inversion** — components call functions from `api/` and
  context hooks, never `fetch` directly. The server is the only backend.
- **Interface Segregation** — shared components (`FormField`,
  `QuantityStepper`) accept only the minimal props they need, not a whole
  feature's state object.

## Key TypeScript/React patterns demonstrated

Useful reference points if you're new to the codebase or to TypeScript:

- **`interface` vs `type` union** — `interface` for object shapes
  (`LoginResponse`), `type` + `|` for "one of these values" (`AuthMode`,
  `ToastType['status']`).
- **`import type`** — this project has `verbatimModuleSyntax` enabled, so
  type-only imports must use `import type { ... }` explicitly.
- **Utility types** — `Omit<CartItem, 'quantity'>` derives the add-to-cart
  payload shape from `CartItem` instead of duplicating it by hand.
- **Controlled forms** — all inputs use `value`/`onChange`, never
  uncontrolled refs.
- **The `isCancelled` cleanup pattern** — data-fetching effects
  (`useProducts`, `useProductDetail`, and the auth and cart providers) guard
  against setting state after unmount or a newer fetch. A plain variable
  inside the effect (not `useState`) is set in the cleanup, and the check
  sits after the `await`.
- **Custom hooks returning handlers, not raw setters** — hooks expose
  `onUsernameChange`, not `setUsername`, so consuming components depend on a
  behavioral contract rather than directly on `useState`'s setter.
- **Context split into three files** — see `src/context/` above; keeps
  Vite's fast-refresh working and keeps each file's export list to one kind of
  thing (a context object, a component, or a hook).
- **Nested layout routes for auth guarding** — `ProtectedRoute` renders
  `<Outlet />` so any number of protected pages can nest under one guard
  without repeating the check.

## Import order convention

Within a file, imports are grouped and commented in this order, blank line
between groups: `// External` (npm packages) → `// Types` → `// Api` →
`// Context` → `// Hooks` → `// Utils` → `// Components` → `// Features` →
`// CSS`. The order mirrors the dependency layering above — the further down
the list, the closer to the UI the import is.
