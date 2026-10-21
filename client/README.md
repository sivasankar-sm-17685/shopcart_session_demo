A React + TypeScript storefront demo — a landing/auth page, a product catalog
backed by [DummyJSON](https://dummyjson.com/), and a cart — built incrementally
as a TypeScript learning project, and intended as an onboarding reference for
the team.

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

Open the local URL printed by Vite (usually http://localhost:5173).

### Available commands

- `npm run dev`: start the development server.
- `npm run lint`: check the source with ESLint.
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run preview`: serve the production build locally after building.

The committed npm lockfile uses the npm 8-compatible format. Dependencies and
build output are excluded from version control.

## Features

- **Landing / Sign in / Sign up** (`/`) — a full-page background with a
  centered glass-style card. Sign in and sign up share one form, switching via
  a typed `AuthMode` union (`'signin' | 'signup'`). Sign in calls DummyJSON's
  `/auth/login`; sign up calls `/users/add` (DummyJSON simulates account
  creation but does not persist it, so new accounts can't be signed into
  afterwards — sign-up success routes back to the sign-in tab).
- **Product list** (`/products`) — fetches `https://dummyjson.com/products`
  and renders a responsive grid with loading/error states.
- **Product detail** (`/products/:id`) — fetches a single product, an image
  gallery with click-to-select, derived discount pricing, stock status, and
  policy information (warranty/shipping/returns).
- **Cart** (`/cart`) — add/remove items and adjust quantity via a shared
  `QuantityStepper` component, used both on the detail page and the cart page.
- **Auth-gated routing** — `/products`, `/products/:id`, and `/cart` are
  nested under a single `ProtectedRoute` layout route, so any new page added
  under that route is automatically guarded with zero extra code.
- **Toasts** — success/failure notifications with a manual close button and a
  3-second auto-dismiss timer.

## Architecture

The codebase is organized by responsibility rather than by page, so each layer
only knows about the one below it:

```
src/
  api/          Plain fetch wrappers — no React, no state. One function per
                endpoint (e.g. loginUser, getProducts, getProductById).
  types/        Shared TypeScript types — interfaces for API response shapes,
                discriminated unions for state like AuthMode and CartAction.
  utils/        Pure helper functions (localStorage access, form validation) —
                no React dependency, easy to unit test in isolation.
  context/      React Context + useReducer for state shared across unrelated
                components (currently: the cart). Split into three files per
                Context to keep Vite's fast-refresh happy:
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

- **Single Responsibility** — `authApi.ts` only knows how to talk to
  DummyJSON; `validation.ts` only knows validation rules; `useAuthForm`
  orchestrates state and calls the other two; `AuthForm`/`AuthCard` only
  render UI. Each piece can change independently.
- **Dependency Inversion** — components call functions from `api/`/`context/`
  hooks, never `fetch`/`localStorage` directly. Swapping DummyJSON for a real
  backend later only touches the `api/` layer.
- **Interface Segregation** — shared components (`FormField`,
  `QuantityStepper`) accept only the minimal props they need, not a whole
  feature's state object.

## Key TypeScript/React patterns demonstrated

Useful reference points if you're new to the codebase or to TypeScript:

- **`interface` vs `type` union** — `interface` for object shapes
  (`LoginResponse`), `type` + `|` for "one of these values" (`AuthMode`,
  `ToastType['status']`).
- **Discriminated unions for actions** — `CartAction` in `types/cart.ts` tags
  each variant with a literal `type` field, letting `cartReducer`'s `switch`
  narrow `action.payload` per case with no manual type guards.
- **`import type`** — this project has `verbatimModuleSyntax` enabled, so
  type-only imports must use `import type { ... }` explicitly.
- **Utility types** — `Omit<CartItem, 'quantity'>` derives the add-to-cart
  payload shape from `CartItem` instead of duplicating it by hand.
- **Controlled forms** — all inputs use `value`/`onChange`, never
  uncontrolled refs.
- **The `isCancelled` cleanup pattern** — every data-fetching hook
  (`useProducts`, `useProductDetail`) guards against setting state after
  unmount/re-fetch using a plain closure variable (not `useState`) flipped in
  the `useEffect` cleanup function. See the hooks for the full reasoning.
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
