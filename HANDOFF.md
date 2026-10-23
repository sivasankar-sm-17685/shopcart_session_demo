# Project handoff / context for a new agent session

This file exists so a new Copilot Chat session (opened with `app/` as the
workspace root) has full context without the user re-explaining anything.
Read this before doing anything else in this repo.

## What this project is

A TypeScript learning project for onboarding a client/frontend-focused team,
being built incrementally by the user with an AI tutor guiding + reviewing
(not implementing for them, see "Working agreement" below). It's a small
storefront app: landing/auth page, product catalog, and a cart — originally
proxying DummyJSON directly from the client, **now fully wired through a
custom Node/Express BFF server that both of the halves below depend on.**
Both `client/` and `server/` are feature-complete as of this writing; what's
left is polish, docs, and optional hardening (see "Known limitations" and
"Immediate next steps").

## Repo structure (monorepo, single git repo at `app/` root)

```
app/
  client/   React + TypeScript + Vite frontend (fully built, wired to server)
  server/   Node + TypeScript + Express backend (fully built: auth, products, cart)
  Readme.md top-level readme — filled in, links to this file + client/README.md
  .gitignore
```

This used to be two things: a standalone client repo
(`typescript_session_demo`, with full git history) and a separately-scaffolded
server repo that was deleted and rebuilt from scratch. They were merged into
this single monorepo on 2026-10-21, with a **fresh git history**. The merged
repo now lives on GitHub as **`sivasankar-sm-17685/shopcart_session_demo`**,
branch **`code_splitup`** — push there to persist work, same as before.

## ⚠️ Working agreement — read this first

- **The user is learning by writing code themselves.** Default stance: do
  **not** implement/write feature code files unless the user gives an
  explicit instruction to implement/build/fix it (e.g. "implement this",
  "fix it for me", "do it for me", "go ahead"). Default mode is: explain the
  plan/concept + give guidance/snippets for the user to type themselves, then
  review what they wrote and flag bugs/improvements. This pattern held for
  the entire client + server build — almost every file below was written by
  the user first and reviewed/corrected afterward, not written by the
  assistant from scratch.
- Answering clarifying questions is **not** the same as authorization to
  implement a whole feature/project. If scaffolding something non-trivial,
  ask directly: "do you want me to build this, or do you want to write it
  yourself with my guidance?"
- This applies to every sub-project in this repo (client AND server).
- **Exception, already agreed with the user:** CSS is written directly by the
  assistant (established division of labor) — the user writes
  TSX/logic/server code, the assistant writes CSS when styling is needed.
- Also acceptable to implement directly: mechanical refactors explicitly
  approved via a posted plan, quick bug fixes explicitly requested with
  wording like "fix both issues"/"implement X", and critical bugs found
  during review/testing once the user says "go ahead" on a posted plan.
- When a non-trivial piece of work is about to start (e.g. a new feature
  slice, a cross-cutting refactor), it's good practice to post a plan first
  (see memory tool / `/memories/session/plan.md` pattern used throughout this
  project) and get explicit go-ahead before writing code, even if the user's
  request sounds like approval-in-advance.

## `client/` — fully built, wired to the server

### Architecture (layered, SOLID-influenced)

```
client/src/
  api/          Plain fetch wrappers, no React/state (authApi.ts, productsApi.ts,
                 cartApi.ts) — all three point at the server (VITE_API_BASE_URL),
                 not DummyJSON directly anymore.
  types/        Shared types: interfaces for object shapes, `type` unions for
                 "one of these values" (auth.ts, products.ts, cart.ts, toast.ts)
  utils/        Pure helpers, no React (validation.ts, browser.ts for localStorage)
  context/      React Context for cross-tree state — TWO contexts now, both
                 following the same 3-file split per Context (Vite fast-refresh
                 friendly):
                   authContextInstance.ts / AuthContext.tsx / (consumed via useAuth.ts)
                   cartContextInstance.ts / CartContext.tsx / useCart.ts
  hooks/        Custom hooks owning component-level state + orchestration
                 (useAuthForm, useProducts, useProductDetail, useToast)
                 useAuth.ts now lives here only as a thin useContext consumer —
                 the actual state lives in context/AuthContext.tsx (see lesson below).
  providers/    AppProviders.tsx — composition root: <AuthProvider><CartProvider>
                 {children}</CartProvider></AuthProvider>, imported once in main.tsx.
  components/   Reusable presentational UI, minimal props, no feature logic
                 (FormField, QuantityStepper, Toast, ToastStack, NavBar,
                 PageLoader, ProtectedRoute, ProductCard, ProductDetail)
  features/     Page-level components composing hooks + components for one
                 feature (features/auth, features/Products, features/Cart)
  App.tsx       Route definitions only
  main.tsx      Bootstraps React + BrowserRouter + AppProviders. Nothing else.
```

### Env

`client/.env` (gitignored, `.env.example` committed) needs:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

Vite-specific gotcha: env vars **must** be prefixed `VITE_` to be exposed to
client code via `import.meta.env` — anything else is silently dropped from
the bundle. Vite also only picks up `.env` changes on dev-server restart, not
hot-reload.

### Routes

- `/` — `AuthCard`: sign in/sign up tabs sharing one form. Both now call the
  **server's** `/api/auth/signin` / `/api/auth/signup` (not DummyJSON
  directly). Sign-up still doesn't persist (DummyJSON simulates it).
- `/products`, `/products/:id`, `/cart` — nested under one
  `<Route element={<ProtectedRoute />}>` layout route.
- `/products` — grid from the server's `GET /api/products` (supports
  `?limit=&skip=` pagination).
- `/products/:id` — single product via `GET /api/products/:id`, add-to-cart /
  quantity stepper now round-trips to the real server-backed cart.
- `/cart` — reads/mutates cart via `useCart()`, which now calls the server's
  `/api/cart/:userId/...` endpoints (see Cart section below) instead of a
  local reducer.

### Auth — now a shared Context (critical lesson, read this)

- **`useAuth` used to be a plain hook** (its own `useState`, no Context) —
  this was a real, significant bug caught during browser testing: every
  component calling `useAuth()` got its own **independent** state. Since
  `CartProvider` wraps the whole app and mounts _before_ login,
  `CartProvider`'s own `useAuth()` instance froze `token`/`userId` at `null`
  forever — `signIn()` elsewhere never propagated to it, so **every cart
  mutation silently no-op'd with zero network requests**, invisible from
  reading any single file in isolation.
- **Fixed by converting `useAuth` into a real Context** — `authContextInstance.ts`
  (`createContext`) + `AuthContext.tsx` (`AuthProvider`, owns the actual
  `token`/`userId` state + `signIn`/`signOut` + localStorage sync) +
  `hooks/useAuth.ts` (now just a thin `useContext` consumer, mirrors
  `context/useCart.ts` exactly). `AuthProvider` must wrap `CartProvider` in
  `AppProviders.tsx` (Cart depends on Auth, not vice versa).
  **Lesson: any hook meant to hold state shared across independently-mounted
  components must be Context-backed, not a plain hook — a plain hook only
  shares its _logic_, never its _instance state_, across call sites.**
- `signIn(accessToken, userId)` now stores **both** values in localStorage
  (`authToken`, `authUserId`) — the original version only stored the token,
  which silently blocked all cart wiring later since there was no `userId` to
  build `/api/cart/:userId` URLs with.

### Cart — now server-backed (was in-memory-only)

- `types/cart.ts` — `CartItem`, `CartContextValue` (`items`, `isLoading`
  for the _initial_ fetch only, `isUpdatingCart` for in-flight mutations —
  **two separate flags, not one**; see lesson below), `GetCartResponse`.
  `CartAction` (the old reducer's discriminated union) is now dead/removed —
  all business logic (reject-on-duplicate, auto-remove-at-zero) moved
  server-side; the client just reflects whatever the server returns.
- `CartContext.tsx` — calls `useAuth()` internally for `token`/`userId`,
  fetches the cart on mount/auth-change via a `useEffect` (standard
  `isCancelled` pattern), and the four mutations (`addItem`/`removeItem`/
  `updateQuantity`/`clearCart`) all call `api/cartApi.ts` and update local
  state from the server's response.
- **Lesson: don't reuse one `isLoading` flag for both the initial fetch and
  every subsequent mutation.** The original implementation did this, which
  made `CartList.tsx`'s `PageLoader` guard fire (unmounting the whole cart
  list) on every single quantity-stepper click. Split into `isLoading`
  (initial fetch → drives `PageLoader`) and `isUpdatingCart` (mutations →
  only disables the relevant button/stepper).

### Toasts

- `useToast.ts` (list state) + `Toast.tsx`/`ToastStack.tsx` (UI) — unchanged
  from before. `showToast` is threaded as a prop into `AuthCard`,
  `ProductDetail`, and now `CartList` too (reads `error` from `useCart()` and
  surfaces it via toast, same pattern as `ProductDetail`'s own fetch error).

### Key patterns/lessons already taught (don't re-teach from scratch)

- `interface` for object shapes, `type` + `|` for unions (`AuthMode`).
- `import type { ... }` required for type-only imports (`verbatimModuleSyntax`).
- `Omit<T, 'field'>` and composition to derive shapes instead of duplicating.
- `catch (err)` — `err` is `unknown`; narrow with `err instanceof Error`.
- **The `isCancelled` cleanup pattern** in every data-fetching hook/effect — a
  plain `let isCancelled = false` _inside_ the effect (not `useState`), with
  the check placed **after** the `await`, not before (a real bug was caught
  in `CartContext.tsx`'s initial fetch where the check was misplaced before
  the `await`, defeating its purpose — the check only guards against state
  updates from a fetch that's already stale by the time it resolves).
- Custom hooks return handler functions (`onUsernameChange`), not raw
  `useState` setters — consumers depend on a behavioral contract.
- Nested layout routes (`<Route element={<ProtectedRoute/>}>`) instead of
  wrapping every protected route's `element` individually.
- Import order convention: `// External` → `// Types` → `// Api` →
  `// Context` → `// Hooks` → `// Utils` → `// Components` → `// Features` →
  `// CSS`, blank line between groups, category comment above each.
- Shared props between a component + its owning hook use ONE interface
  (e.g. `AuthCardProps`), not two hand-duplicated ones.
- **Express's `Request`/`Response` types shadow global Fetch API types of the
  same name** — if you import `NextFunction` from `'express'` but forget to
  also import `Request`/`Response` explicitly, TypeScript silently resolves
  those two names to the _global_ DOM/Fetch API types instead of Express's,
  producing confusing errors like `req.body` typed as a `ReadableStream`.
  Always import all three explicitly from `'express'`.

### Known minor leftovers

- No automated tests exist yet.
- `client/.gitignore` was removed (redundant with root `app/.gitignore`,
  which already covers `client/` and `server/` both).

## `server/` — fully built: Auth, Products, Cart

### Architecture

```
server/src/
  types/        auth.ts, product.ts, cart.ts — request/response shapes
  config/       env.ts — validates THIRD_PARTY_BASE_URL exists at import time,
                 narrows process.env's string|undefined to a plain string
  utils/        ApiError.ts (class extends Error, carries statusCode — lets
                 errorHandler distinguish "expected" errors from real bugs via
                 instanceof), validation.ts (manual request body/param validators)
  services/     authService.ts, productService.ts — DummyJSON proxy calls,
                 zero Express types, throw ApiError(response.status, message)
  store/        cartStore.ts — cart persistence as a flat JSON file
                 (server/data/cart.json, gitignored), Record<string, CartItem[]>
                 keyed by userId-as-string (JSON object keys are always
                 strings). Owns all business rules: reject duplicate add (409),
                 auto-remove at quantity <= 0, 404 on missing item.
  controllers/  authController.ts, productController.ts, cartController.ts —
                 (req, res, next) handlers; validate input via utils/validation.ts,
                 call services/store, try/catch -> next(err) on failure
  routes/       authRoutes.ts, productRoutes.ts, cartRoutes.ts — cartRoutes.ts
                 uses Router({ mergeParams: true }) (needed since :userId is
                 captured by the parent mount path in app.ts, not this router
                 itself) and router.use(requireAuth) before all 5 routes
  middleware/   errorHandler.ts (checks instanceof ApiError first, else
                 generic 500 + logs), requireAuth.ts (validates Bearer token
                 via DummyJSON's /auth/me, checks token's id matches :userId —
                 403 if someone tries another user's cart)
  app.ts        express() + cors + express.json() + mount all 3 routers under
                 /api/auth, /api/products, /api/cart/:userId + errorHandler last
  index.ts      dotenv.config() (BEFORE importing app — see lesson below),
                 app.listen(PORT)
```

### Env

`server/.env` (gitignored, `.env.example` committed):

```
PORT=4000
THIRD_PARTY_BASE_URL=https://dummyjson.com
CLIENT_ORIGIN=http://localhost:5173
```

(Originally named `DUMMYJSON_BASE_URL`, renamed to `THIRD_PARTY_BASE_URL` —
more generic/accurate name for "the upstream API being proxied".)

### Endpoints actually implemented

- `POST /api/auth/signin`, `POST /api/auth/signup` — proxy DummyJSON, forward
  its actual status code + message via `ApiError`.
- `GET /api/products` (supports `?limit=&skip=`), `GET /api/products/:id` —
  proxy DummyJSON.
- `GET /api/cart/:userId`, `POST /api/cart/:userId/items`,
  `PATCH /api/cart/:userId/items/:id`, `DELETE /api/cart/:userId/items/:id`,
  `DELETE /api/cart/:userId` — all require a valid `Authorization: Bearer
<token>` matching `:userId` (via `requireAuth`), fully tested end-to-end
  (including the `409` duplicate-add rejection and `404` not-found cases) via
  both curl and live browser testing.

### Key patterns/lessons already taught (server-specific)

- **TypeScript 7.0.2 packaging bug** — `npm install typescript` with no
  version pin resolved `latest` = `7.0.2`, whose `bin/tsc` file has no `.js`
  extension while its own `package.json` declares `"type": "module"` — Node's
  ESM loader refuses to load an extensionless file in that context, crashing
  `npx tsc --init` immediately. Fixed by pinning `typescript@5.7.3`. **If
  `npx tsc` crashes with `ERR_UNKNOWN_FILE_EXTENSION`, check for this.**
- **`module: "commonjs"` in `tsconfig.json`, no `"type": "module"` in
  `package.json`** — deliberate, avoids the Node-ESM gotcha (explicit `.js`
  extensions required on relative imports) entirely for this learning
  project. Side effect worth knowing: under CommonJS, `import` statements
  compile to `require()` calls that execute **in the exact order written**
  (no ESM-style hoisting) — this is _why_ `dotenv.config()` written before
  `import { app } from './app'` in `index.ts` actually works correctly here
  (loads env vars before `app.ts` and anything it transitively requires ever
  executes) — this would NOT hold under real ESM, where all imports resolve
  before any of the importing module's own statements run.
- **`ApiError` class pattern** — `class ApiError extends Error { statusCode }`
  lets `errorHandler.ts` do `instanceof ApiError` to distinguish expected,
  already-classified errors (wrong credentials, duplicate cart item, bad
  input) from genuinely unexpected ones, which fall through to a generic
  `500`. A plain object/interface couldn't support this — `instanceof` only
  works against real classes (checks the prototype chain), and interfaces
  don't exist at runtime at all (erased at compile time).
- **Always read the actual upstream/own error body before throwing a generic
  message** — `const errorBody = await response.json().catch(() => null);
throw new ApiError(response.status, errorBody?.message ?? fallback)` is the
  pattern used in every service function — forwards DummyJSON's real status
  code and message instead of a hardcoded guess.
- **Express's `req.params[key]` types as `string | string[] | undefined`**,
  not just `string | undefined` — a validator helper taking a route param
  needs to accept and reject the array case explicitly (none of this
  project's routes use array-style params, so an array value is always
  treated as invalid input).
- **No request validation = real data-corruption risk** — none of the
  controllers originally validated `req.body`/`req.params` types before
  trusting them; TypeScript's compile-time `number`/`string` annotations
  don't hold at runtime since `req.body` is `any`. Fixed via
  `utils/validation.ts` (`validateAddToCartBody`, `validateUpdateQuantityBody`,
  `validateAuthCredentials`, `validateNumericParam`), called at the top of
  every controller function, throwing `ApiError(400, ...)` on bad input.
  Manual functions were chosen over a schema library (e.g. zod) deliberately
  — avoids a new dependency for a learning project.

## Known, accepted limitations (not bugs — documented trade-offs)

- **`cartStore.ts`'s file-write race condition** — every cart operation does
  read-whole-file → mutate → write-whole-file-back, with no locking. Two
  near-simultaneous requests for the same user could race (classic
  lost-update). Accepted as a known limitation for a single-user learning
  project rather than adding file-locking or a real DB now — flagged
  explicitly as a "next lesson" candidate, not something to fix reflexively.
- **`requireAuth` calls DummyJSON's `/auth/me` on every single cart request**,
  with no caching — every cart operation costs 2 sequential network round
  trips (token validation + the actual operation). Fine for this project's
  scale; a real app would likely cache validated tokens briefly. **Being
  actively replaced right now — see "IN PROGRESS" section below, which
  eliminates this entirely rather than caching it.**
- **API routes are not versioned** (`/api/...`, not `/api/v1/...`) —
  deliberate: this is a BFF with exactly one first-party consumer (this
  client) that's updated in lockstep with the server, not a public API with
  external consumers who need a stable contract across versions.

## 🚧 IN PROGRESS — own auth (SQLite + opaque sessions + HttpOnly cookies)

Replacing DummyJSON-proxied auth entirely with the server's own user store.
This satisfies three asks the user raised: (1) auth via cookies instead of a
client-stored Bearer token, (2) eliminating the per-request DummyJSON
`/auth/me` validation call, (3) owning sign-up/sign-in against a real DB
instead of relying on DummyJSON. Turns out (3) solves (2) "for free" — once
you verify your own session locally (a fast indexed SQL lookup), there's no
external network call left to cache.

**Locked decisions (do not re-litigate):**

- DB: **SQLite** via `better-sqlite3` — confirmed feasible (SQLite CLI
  pre-installed on the dev machine; no Postgres/MySQL-running/Docker
  available). **Must pin to `better-sqlite3@11.9.1`** — installing with no
  version (`npm install better-sqlite3`) resolves `latest` (currently
  `13.0.3`), which requires **Node >=22** (this machine runs Node 18.12.0)
  and has no prebuilt binary for that combo, falling back to a `node-gyp`
  compile that _also_ fails (`ModuleNotFoundError: No module named
'distutils'` — removed from Python 3.12+). v11.x has no `engines`
  restriction and installs via prebuilt binary with zero compilation. **If
  `npm install better-sqlite3` ever fails like this again, check this.**
- Password hashing: Node built-in `crypto.scryptSync` (not `bcrypt` — avoids a
  dependency), per-user random salt (`randomBytes(16)`) stored **separately**
  from the hash, compared at verify-time via `crypto.timingSafeEqual` (not
  `===`, to avoid timing attacks) on `Buffer.from(x, 'hex')` conversions of
  both sides.
- Session tokens: `crypto.randomBytes(32).toString('base64url')` (256 bits of
  entropy, more compact than hex) — not `randomUUID()` (less entropy), not
  JWT (avoids a signing-library dependency; opaque tokens looked up via a
  local DB query are simpler to reason about than signature verification for
  this project's scale).
- No email verification for signup — username + password only, same as before.
- Cart routes will drop `:userId` from the URL entirely once this lands
  (`/api/cart/:userId/...` → `/api/cart/...`) — the server derives the
  authenticated user from the session cookie itself, nothing left to compare
  a URL param against.
- New dependencies: `better-sqlite3` (pinned to `11.9.1`, see above) +
  `@types/better-sqlite3`; `cookie-parser` not yet added (needed in Stage B).

**Stage A (DB foundation) — ✅ fully complete and verified end-to-end.**

- ✅ `server/src/config/db.ts` — opens/creates `server/data/app.db` (gitignored
  via existing `*/data/app.db` pattern), `users`/`sessions` tables created via
  `db.exec(...)` with `IF NOT EXISTS`. Verified working via `sqlite3
data/app.db ".schema"`.
- ✅ `server/src/utils/password.ts` — `hashPassword`/`verifyPassword`. **Caught
  a real bug during review**: salt/hash variable names were initially swapped
  inside `hashPassword` (random value assigned to `hash`, derived value
  assigned to `salt`) — this silently breaks `verifyPassword` for every
  password, since it re-derives using the wrong input as the salt. Fixed and
  verified with an actual hash→verify round-trip test (correct password →
  `true`, wrong password → `false`).
- ✅ `server/src/store/userStore.ts` — `createUser` (catches
  `SQLITE_CONSTRAINT_UNIQUE` → `ApiError(409, ...)`, lets anything else
  propagate), **`findUserByName`** (not `findUserByUsername`), **`findUserById`**
  (not `findUserByUserId`) — actual exported names, note the naming for future
  reference. SQL column aliasing (`password_hash AS passwordHash`) used to
  keep TS-side camelCase without manual remapping. `User` type lives in
  `types/auth.ts`. One casing gotcha hit along the way: `utils/ApiError.ts`
  got renamed to lowercase `apiError.ts` at some point (fixing an import
  that was using the wrong case) — now consistent everywhere, but note the
  actual filename is lowercase if creating new imports.
- ✅ `server/src/store/sessionStore.ts` — `createSession` (generates token +
  7-day expiry internally, returns the token), `findSession` (checks expiry,
  returns `undefined` if missing/expired), `deleteSession`. **Bugs caught
  during review**: (1) `expiresAt` was computed with `Date.now() * 7 * 24 *
60 * 60` (multiplication — produces a nonsensical huge number) instead of
  `Date.now() + 7 * 24 * 60 * 60 * 1000` (addition); (2) `findSession`
  initially took an unused `userId` param, had no `return` statement, and no
  expiry check at all; (3) `deleteSession`'s first draft tried to `SELECT`
  columns in a `DELETE` statement (invalid SQL) and used `.get()` instead of
  `.run()`. All fixed.
- **End-to-end sanity test passed** (create user → find by username → verify
  correct/wrong password → create session → find session → delete session →
  confirm `undefined` after delete → duplicate username → `409`) — full
  Stage A layer confirmed working together, independent of any HTTP/Express
  layer (tested via a standalone `ts-node` script, bypassing routes/controllers
  entirely).

**Now starting Stage B** — rewriting `authService.ts` (currently still the old
DummyJSON-proxying version, shown as the active file) to use `userStore.ts`/
`sessionStore.ts`/`utils/password.ts` instead.

**Still pending (Stages B–F):**

- **Stage B** — rewrite `authService.ts`/`authController.ts` to use the DB +
  issue the session as an HttpOnly cookie (`res.cookie(...)`) instead of
  returning it in the JSON body; add `POST /api/auth/signout`; add
  `cookie-parser` + `cors({ credentials: true })` to `app.ts`.
- **Stage C** — rewrite `requireAuth.ts` to look up the session cookie
  locally (no more DummyJSON `/auth/me` call); add `req.userId` via an
  Express `Request` type augmentation (`types/express.d.ts`); drop `:userId`
  from `cartRoutes.ts`/`cartController.ts` (derive from `req.userId` instead).
- **Stage D** — rewrite `client/src/context/AuthContext.tsx`: there's no
  longer a client-readable token at all (HttpOnly), so `isAuthenticated` can't
  be determined synchronously from `localStorage` anymore — needs an async
  `GET /api/auth/me` check on mount with its own loading state;
  `ProtectedRoute.tsx` must distinguish "still checking" from "confirmed
  logged out" to avoid a page-refresh flash-redirect bug.
- **Stage E** — add `credentials: 'include'` to every client `fetch` call;
  drop the `Authorization` header and `userId`/`token` params from
  `cartApi.ts` entirely.
- **Stage F** — full end-to-end verification: curl with cookie jars, full
  browser flow including the page-refresh edge case, confirm session
  isolation between different users/browsers.

A full step-by-step breakdown (exact file-by-file guidance for every stage)
exists in this conversation's session memory (`/memories/session/plan.md`)
but that's cleared when the session ends — **this summary is the durable
record**; re-derive specifics from the "Locked decisions" above if resuming
this work in a new session.

## Immediate next steps (pending, not yet decided with the user)

1. Finish the auth migration above (Stages A–F).
2. Write a dedicated onboarding doc for the team (original end goal of the
   whole exercise) — architecture walkthrough, key TypeScript/React/Express
   concepts demonstrated, setup instructions. Not started yet.
3. Automated tests — none exist yet, client or server.
4. Optional hardening — the "API not versioned" known limitation above, if
   ever needed.
