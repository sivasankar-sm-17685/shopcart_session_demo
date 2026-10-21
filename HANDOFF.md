# Project handoff / context for a new agent session

This file exists so a new Copilot Chat session (opened with `app/` as the
workspace root) has full context without the user re-explaining anything.
Read this before doing anything else in this repo.

## What this project is

A TypeScript learning project for onboarding a client/frontend-focused team,
being built incrementally by the user with an AI tutor guiding + reviewing
(not implementing for them, see "Working agreement" below). It's a small
storefront app: landing/auth page, product catalog from DummyJSON, a cart,
and (now) a server being added as a second "learn backend concepts" phase.

## Repo structure (monorepo, single git repo at `app/` root)

```
app/
  client/   React + TypeScript + Vite frontend (fully built, see below)
  server/   Node + TypeScript + Express backend — EMPTY, not yet started
  Readme.md top-level readme (currently empty, needs filling in)
  .gitignore
```

This used to be two things: a standalone client repo
(`typescript_session_demo`, with full git history, GitHub remote
`sivasankar-sm-17685/typescript_session_demo`) and a separately-scaffolded
server repo that was deleted and is being rebuilt from scratch. They were
merged into this single monorepo on 2026-10-21, with a **fresh git history**
(the old client repo's `.git` was deleted locally — full history is still
safe on GitHub if ever needed, this repo just doesn't carry it forward).

## ⚠️ Working agreement — read this first

- **The user is learning by writing code themselves.** Default stance: do
  **not** implement/write feature code files unless the user gives an
  explicit instruction to implement/build/fix it (e.g. "implement this",
  "fix it for me", "do it for me"). Default mode is: explain the plan/concept
  - give a code snippet for the user to type themselves, then review what
    they wrote and flag bugs/improvements.
- Answering clarifying questions is **not** the same as authorization to
  implement a whole feature/project. If scaffolding something non-trivial,
  ask directly: "do you want me to build this, or do you want to write it
  yourself with my guidance?"
- This applies to every sub-project in this repo (client AND server), not
  just whichever one was being discussed first.
- **Exception, already agreed with the user:** CSS is written directly by the
  assistant (established division of labor) — the user writes
  TSX/logic/server code, the assistant writes CSS when styling is needed.
- Also acceptable to implement directly: mechanical refactors explicitly
  approved via a posted plan, and quick bug fixes explicitly requested with
  wording like "fix both issues" / "implement X".

## `client/` — fully built, feature-complete for its current scope

### Architecture (layered, SOLID-influenced)

```
client/src/
  api/          Plain fetch wrappers, no React/state (authApi.ts, productsApi.ts)
  types/        Shared types: interfaces for object shapes, `type` unions for
                 "one of these values" (auth.ts, products.ts, cart.ts, toast.ts)
  utils/        Pure helpers, no React (validation.ts, browser.ts for localStorage)
  context/      React Context + useReducer for cross-tree state (currently: cart)
                 Split into 3 files per Context to keep Vite fast-refresh happy:
                   cartContextInstance.ts  — createContext() call only
                   CartContext.tsx         — the *Provider component only
                   useCart.ts              — the consumer hook only
  hooks/        Custom hooks owning component-level state + orchestration
                 (useAuthForm, useProducts, useProductDetail, useToast, useAuth)
  providers/    AppProviders.tsx — composition root nesting all app-wide
                 providers, imported once in main.tsx. Keeps main.tsx and any
                 future new provider additions decoupled.
  components/   Reusable presentational UI, minimal props, no feature logic
                 (FormField, QuantityStepper, Toast, ToastStack, NavBar,
                 PageLoader, ProtectedRoute, ProductCard, ProductDetail)
  features/     Page-level components composing hooks + components for one
                 feature (features/auth, features/Products, features/Cart)
  App.tsx       Route definitions only
  main.tsx      Bootstraps React + BrowserRouter + AppProviders. Nothing else.
```

### Routes

- `/` — `AuthCard`: full-page background, centered glass-style card, sign
  in/sign up tabs sharing one form (typed `AuthMode = 'signin' | 'signup'`
  union). Sign in calls DummyJSON `/auth/login`; sign up calls `/users/add`
  (DummyJSON simulates this, does not persist — new accounts can't actually
  log back in, sign-up success routes back to the sign-in tab).
- `/products`, `/products/:id`, `/cart` — all nested under one
  `<Route element={<ProtectedRoute />}>` layout route (renders `<NavBar/>` +
  `<Outlet/>`, or `<Navigate to='/' />` if not authenticated). Any new
  protected page just nests under this same parent — zero extra guard code.
- `/products` — grid from `GET /products` (DummyJSON), loading/error states
  via a shared `PageLoader` component.
- `/products/:id` — single product via `GET /products/:id`, image gallery
  with click-to-select, derived discount pricing (DummyJSON only returns the
  already-discounted price + a %, original price is computed), stock status,
  warranty/shipping/return policy text, and a `QuantityStepper` (shared
  component, also used in `/cart`) that replaces "Add to cart" once the item
  is already in the cart.
- `/cart` — reads/mutates cart via `useCart()`, empty state with a "browse
  products" CTA, per-row quantity stepper (decrementing to 0 removes the
  item), remove button, total, clear-cart button, back link.

### Auth

- `useAuth.ts` — wraps `localStorage` (key `authToken`) via `useState` with a
  lazy initializer; `signIn(token)`/`signOut()`; `isAuthenticated` derived
  from whether the token is non-null. Real DummyJSON `accessToken` from the
  login response is stored (not just the username — this was a bug caught
  and fixed during development).
- `useAuthForm.ts` — owns `mode/username/password/isSubmitting/error` state,
  calls `validateAuthFormData` before submitting, calls `loginUser`/
  `signUpUser` from `api/authApi.ts`, calls `showToast` + `navigate` on
  success/failure. Validation: username required (not email format —
  DummyJSON auth is username/password, the field was renamed from "email" to
  "username" partway through development to match reality), password
  strength regex only enforced on sign-up, not sign-in (sign-in just checks
  non-empty — the server is the source of truth for "is this correct").

### Cart (Context + `useReducer`, discriminated union actions)

- `types/cart.ts` — `CartItem`, `CartAction` (discriminated union: ADD_ITEM /
  REMOVE_ITEM / UPDATE_QUANTITY / CLEAR_CART, each tagged with a literal
  `type` field so the reducer's `switch` narrows `payload` per case),
  `CartContextValue`.
- `CartProvider` wraps the whole app (via `AppProviders`, not scoped tighter
  to just the protected routes — deliberate, keeps it simple, costs nothing).
- Currently **in-memory only** — resets on page refresh. No persistence yet.
  This is one of the natural things the new `server/` could eventually own.

### Toasts

- `useToast.ts` (list state) + `Toast.tsx`/`ToastStack.tsx` (UI). Icon +
  message + manual close button + 3-second auto-dismiss via `useEffect`
  cleanup (`setTimeout` + `clearTimeout` in the cleanup function).

### Key patterns/lessons already taught (don't re-teach from scratch)

- `interface` for object shapes (props, API response shapes), `type` + `|`
  for unions (`AuthMode`, discriminated unions like `CartAction`).
- `import type { ... }` required for type-only imports —
  `verbatimModuleSyntax` is enabled in `tsconfig.app.json`.
- `Omit<CartItem, 'quantity'>` and other utility types to derive shapes
  instead of hand-duplicating fields.
- `catch (err)` — `err` is `unknown`, not `any`; narrow with
  `err instanceof Error` before accessing `.message`.
- **The `isCancelled` cleanup pattern** in every data-fetching hook
  (`useProducts`, `useProductDetail`): a plain `let isCancelled = false`
  declared _inside_ `useEffect` (not `useState` — a real bug was caught where
  someone tried `useState` for this and it didn't work, because the
  in-flight async closure captures a stale value; state updates don't
  retroactively change what a closure already captured). The cleanup
  function mutates the same shared variable. This guards against setting
  state after unmount/re-fetch, and is also why React 18 StrictMode's
  intentional double-invoke of effects in dev doesn't cause bugs here.
- Custom hooks return handler functions (`onUsernameChange`), not raw
  `useState` setters (`setUsername`) — Dependency Inversion, so consumers
  depend on a behavioral contract, not directly on `useState`'s setter shape.
- `&&` vs ternary for conditional rendering — `{value && <JSX/>}` can render
  a stray `0`/`NaN` if `value` is numeric and falsy; safe here since all uses
  are `string | null`.
- Nested layout routes (`<Route element={<ProtectedRoute/>}>` wrapping
  children, `ProtectedRoute` renders `<Outlet/>`) instead of wrapping every
  protected route's `element` individually — scales to any number of new
  protected pages with zero repeated guard code.
- Import order convention (manually applied, no lint plugin): grouped with a
  category comment above each group, blank line between groups — order is
  `// External` (npm packages) → `// Types` → `// Api` → `// Context` →
  `// Hooks` → `// Utils` → `// Components` → `// Features` → `// CSS`. The
  order mirrors the dependency layering above (further down the list = closer
  to the UI).
- Component+hook pairs sharing identical props should use ONE shared
  interface (imported into both), not two hand-duplicated ones that could
  silently drift apart (e.g. `AuthCardProps` used by both `AuthCard.tsx` and
  `useAuthForm.ts`).

### Known minor leftovers / not yet done in `client/`

- No automated tests exist yet.
- Cart has no persistence (resets on refresh) — candidate for the new server
  to own, or `localStorage`, as a future lesson.
- `client/.gitignore` still exists as a leftover from before the monorepo
  merge — redundant with the root `app/.gitignore` now, harmless, could be
  deleted for tidiness.
- Top-level `app/Readme.md` is currently empty — needs content (could link to
  `client/README.md` and a future `server/README.md`).

## `server/` — not started, empty folder

Decisions already made (do NOT re-litigate without reason, just confirm the
user still wants this before building):

- **Stack: Node.js + TypeScript + Express.** Chosen over Java/Spring Boot
  specifically because this team is frontend-focused — same language as the
  client (TypeScript) means the new material is backend _concepts_ (routing,
  middleware, request lifecycle), not also a new language/build system/
  runtime simultaneously. Note: the company's actual separate server team
  uses **Java 17** — a Java version of this server could be a legitimate
  "phase 2" comparison exercise later, but is explicitly not the current plan.
- **Scope: Backend-for-Frontend (BFF) pattern.** Proxy DummyJSON for
  auth (`/auth/login`) and products (`/products`, `/products/:id`); **own
  cart persistence itself** (replacing the client's in-memory Context) via
  real CRUD endpoints — this is more interesting/realistic than a pure
  proxy, and gives genuine REST API practice.
- A full first-draft implementation of this was built once already (by the
  assistant, prematurely/without clear permission — see working agreement
  above) and was deleted at the user's request so they could write it
  themselves. Do not assume you should rebuild it automatically — ask the
  user whether/how they want to start, same as any other feature.
- Suggested folder layout (for when the user is ready to write it), mirroring
  the client's layering: `src/types`, `src/services` (external API calls +
  business logic, no Express types), `src/store` (cart persistence — start
  in-memory, swappable for a real DB later), `src/controllers` (Express
  request handlers), `src/routes`, `src/middleware` (error handling),
  `src/app.ts` (Express app + middleware + route mounting),
  `src/index.ts` (loads env, starts the listener — nothing else).
- Suggested endpoints: `POST /api/auth/login`, `GET /api/products`,
  `GET /api/products/:id`, and cart CRUD under `/api/cart/:userId` (using the
  DummyJSON login response's `id` field as the user key, since there's no
  real session/auth on the server side yet — a good "next lesson" candidate
  once the basics work: validating a token before allowing cart access).
- A `.env` with `PORT`, `DUMMYJSON_BASE_URL`, `CLIENT_ORIGIN` (for CORS, since
  the client runs on `http://localhost:5173`) will be needed.
- Gotcha to flag if building fresh: Node ESM (`"type": "module"` +
  `"module": "NodeNext"`) requires explicit `.js` extensions on relative
  imports, which trips up a lot of newcomers. Recommend plain CommonJS output
  (no `"type": "module"`, `"module": "CommonJS"` in tsconfig) to sidestep
  this entirely for a first backend project.

## Immediate next steps (pending, not yet decided with the user)

1. Fill in `app/Readme.md` with a top-level overview linking to both halves.
2. Decide whether/how to start the server (ask first, per working agreement).
3. Eventually: wire the client's `api/` layer to call this new server instead
   of DummyJSON directly, once the server exists.
4. Write a dedicated onboarding doc for the team (original end goal of the
   whole exercise) — architecture walkthrough, key TypeScript/React concepts
   demonstrated, setup instructions. Not started yet.
