# Project handoff / context for a new agent session

This file exists so a new Copilot Chat session (opened with `app/` as the
workspace root) has full context without the user re-explaining anything.
Read this before doing anything else in this repo.

## What this project is

A TypeScript learning project for onboarding a client/frontend-focused team,
being built incrementally by the user with an AI tutor guiding + reviewing
(not implementing for them, see "Working agreement" below). It's a small
storefront app: landing/auth page, product catalog, and a cart — originally
proxying DummyJSON directly from the client, then wired through a custom
Node/Express BFF server.

**Current state (2026-10-26): auth migration DONE (Stages A–F).** Sign-in,
sign-up, refresh, sign-out, and the cart all use the server's HttpOnly session
cookie. Two browsers stay isolated: each signed-in user has their own session
row and their own cart. `npx tsc --noEmit -p client/tsconfig.app.json` and
`npm run lint` in `client/` are clean.

## Repo structure (monorepo, single git repo at `app/` root)

```
app/
  client/   React + TypeScript + Vite frontend (auth and cart both on the session cookie)
  server/   Node + TypeScript + Express backend (auth + cart both on own DB/session cookie)
    README.md   how to view / clear the SQLite DB and cart.json (sqlite3 commands)
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
  (Example: Stage B's service + `cookie-parser` install were done by the
  assistant on an explicit "implement step 2 and install the cookie-parser".)
- When a non-trivial piece of work is about to start (e.g. a new feature
  slice, a cross-cutting refactor), it's good practice to post a plan first
  and get explicit go-ahead before writing code, even if the user's request
  sounds like approval-in-advance.
- **Teaching format (agreed 2026-10-24): story first, no code up front.** For
  each stage: (1) recap what's done with an ASCII flow diagram; (2) the next
  change as a **user story**; (3) "current" vs "should be" diagrams; (4) a
  before/after contract table; (5) 2–4 "think first" questions the user answers
  before coding; (6) "done when" checks; (7) what breaks temporarily. Hints only
  on request: nudge → concept → snippet. Use ASCII diagrams (Mermaid may not
  render in the VS Code panel).
- **The user is new to server/backend work (said so 2026-10-24).** Use plain
  words and everyday analogies (session cookie = cinema ticket; a value stuck
  on the request = a sticky note), define a server term the first time it's
  used, and give one small step at a time. Long lists of terms overwhelmed them.
- **Review loop that works:** user writes the code → assistant reads the file
  on disk, runs `npx tsc --noEmit`, says simply what's right/wrong → user fixes
  → repeat. Re-check the file each time: a fix reported "done" was twice not
  saved yet.

## `client/` — auth and cart both on the session cookie

> Stages D–F are done. There is no client-readable token. Cart calls send the
> `session` cookie (`credentials: 'include'`) and never put a user id in the
> URL. Product fetches stay without the cookie: those routes are public.

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

- `/` — `AuthCard`: sign in/sign up tabs sharing one form. Both call the
  **server's** `/api/auth/signin` / `/api/auth/signup` and then `signIn(user)`.
  A logged-in visit (or a refresh) redirects to `/products`; while
  `isCheckingAuth` is true it shows `PageLoader`.
- `/products`, `/products/:id`, `/cart` — nested under one
  `<Route element={<ProtectedRoute showToast={showToast} />}>` layout route.
  While checking, `ProtectedRoute` shows `PageLoader` instead of redirecting.
- `/products` — grid from the server's `GET /api/products` (supports
  `?limit=&skip=` pagination).
- `/products/:id` — single product via `GET /api/products/:id`, add-to-cart /
  quantity stepper round-trips to the server-backed cart.
- `/cart` — reads/mutates cart via `useCart()`, which calls the server's
  `/api/cart` and `/api/cart/items/:id` endpoints. The cookie says whose cart
  it is.

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
- **Stage D (done):** there is no client-readable token. `AuthContextValue` is
  `{ user, isAuthenticated, isCheckingAuth, signIn, signOut }`. `user` is
  `{ id, username } | null` (the same shape as `LoginResponse` /
  `GetMeResponse`). `isAuthenticated` is derived (`user !== null`), not stored.
  `isCheckingAuth` starts `true`. On mount, `getMe()` runs inside the
  `isCancelled` effect; `null` (401) and a thrown error (500/network) both
  leave the user logged out, and `isCheckingAuth` turns off in `finally`.
  `signIn(user)` only sets state. `signOut` calls `POST /api/auth/signout`
  and clears `user` only if that succeeds (a failure rethrows, the UI stays
  signed in, and `ProtectedRoute` shows a failure toast). `localStorage` is
  no longer used for auth (`utils/browser.ts` is now unused; left in place).

### Cart — server-backed (was in-memory-only)

- `types/cart.ts` — `CartItem`, `CartContextValue` (`items`, `isLoading`
  for the _initial_ fetch only, `isUpdatingCart` for in-flight mutations —
  **two separate flags, not one**; see lesson below), `GetCartResponse`.
  `CartAction` (the old reducer's discriminated union) is now dead/removed —
  all business logic (reject-on-duplicate, auto-remove-at-zero) moved
  server-side; the client just reflects whatever the server returns.
- `CartContext.tsx` — calls `useAuth()` only for `isAuthenticated`. When that
  is false it clears `items`. Otherwise a `useEffect` fetches `getCart()`
  (standard `isCancelled` pattern, check after the `await`). The four
  mutations (`addItem`/`removeItem`/`updateQuantity`/`clearCart`) call
  `api/cartApi.ts` with no user id and no token, and store whatever the
  server returns. `cartApi.ts` sends `credentials: 'include'` on every call,
  including `clearCart`, which does not read the 204 body.
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

## `server/` — products + cart built; auth AND cart auth on our own DB/session cookie

> Handy: `server/README.md` has copy-paste `sqlite3` commands to view and clear
> the DB and `cart.json`.

### Architecture

```
server/src/
  types/        auth.ts (User, PublicUser, AuthResult), product.ts, cart.ts —
                 request/response shapes
                 express.d.ts — declaration merging: adds optional
                 `userId?: number` to Express's `Request` (the "sticky note"
                 requireAuth writes and cart controllers read)
  config/       env.ts — validates THIRD_PARTY_BASE_URL exists at import time,
                 narrows process.env's string|undefined to a plain string
                 db.ts — opens server/data/app.db (SQLite), creates the
                 users + sessions tables
                 cookie.ts — SESSION_COOKIE_NAME + SESSION_COOKIE_OPTIONS,
                 the one shared home so authController (writes the cookie)
                 and requireAuth (reads it) can't drift apart
  utils/        apiError.ts (class extends Error, carries statusCode — lets
                 errorHandler distinguish "expected" errors from real bugs via
                 instanceof; NOTE the lowercase filename), validation.ts
                 (manual request body/param validators; also
                 `requireUserId(userId: number | undefined): number` — returns
                 the id or throws ApiError(401), so cart controllers get a
                 plain `number` without a `!` assertion), password.ts
                 (scrypt hashPassword/verifyPassword)
  services/     authService.ts — DB-backed, synchronous, no network calls:
                   signUpUser / loginUser → { user: PublicUser, token }
                   signOutUser(token), getUserFromSession(token) → PublicUser
                   (THROWS ApiError(401) on a missing/expired session — never
                   returns undefined). The old DummyJSON `getCurrentUser` was
                   deleted in Stage C.
                 productService.ts — DummyJSON proxy calls, throws
                 ApiError(response.status, message). No Express types in either.
  store/        cartStore.ts — cart persistence as a flat JSON file
                 (server/data/cart.json, gitignored), Record<string, CartItem[]>
                 keyed by userId-as-string (JSON object keys are always
                 strings). Owns all business rules: reject duplicate add (409),
                 auto-remove at quantity <= 0, 404 on missing item.
                 userStore.ts — createUser / findUserByName / findUserById
                 sessionStore.ts — createSession / findSession / deleteSession
                 (both SQLite via better-sqlite3)
  controllers/  authController.ts, productController.ts, cartController.ts —
                 (req, res, next) handlers; validate input via utils/validation.ts,
                 call services/store, try/catch -> next(err) on failure
  routes/       authRoutes.ts, productRoutes.ts, cartRoutes.ts — cartRoutes.ts
                 is a plain Router() (no mergeParams — there is no :userId in
                 the path any more) with router.use(requireAuth) before all 5
                 routes
  middleware/   errorHandler.ts (checks instanceof ApiError first, else
                 generic 500 + logs), requireAuth.ts (synchronous: reads the
                 `session` cookie, 401 if missing, getUserFromSession (throws
                 401 if bad/expired), sets req.userId, next(). No Bearer
                 header, no DummyJSON call, no 403)
  app.ts        express() + cors({ origin: CLIENT_ORIGIN, credentials: true })
                 + express.json() + cookieParser() + routers under /api/auth,
                 /api/products, /api/cart + errorHandler last
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
more generic/accurate name for "the upstream API being proxied". Still used by
`productService.ts`.)

### Endpoints actually implemented

- `POST /api/auth/signup` (409 if username taken) and `POST /api/auth/signin`
  (401 `Invalid username or password` for BOTH unknown user and wrong
  password) — own DB; set an HttpOnly `session` cookie and respond with only
  `{ id, username }` (token never in the body).
- `POST /api/auth/signout` — deletes the session row if a cookie is present,
  always clears the cookie, always `204`.
- `GET /api/auth/me` — `{ id, username }` for a valid session cookie, else 401.
  (The client calls this on page load — Stage D, done.)
- `GET /api/products` (supports `?limit=&skip=`), `GET /api/products/:id` —
  proxy DummyJSON.
- Cart (**new cookie-auth paths, Stage C done 2026-10-26** — no `:userId`; the
  user comes from the `session` cookie via `requireAuth` → `req.userId`):
  `GET /api/cart`, `POST /api/cart/items` (body `{ id, quantity }`),
  `PATCH /api/cart/items/:id` (body `{ quantity }`),
  `DELETE /api/cart/items/:id`, `DELETE /api/cart` (204). No cookie → 401;
  expired/unknown/signed-out cookie → 401; duplicate add → 409; missing item →
  404; non-numeric item id → 400. The old `/api/cart/:userId/...` URLs no
  longer exist (404). The client calls these cookie paths (Stage E, done).

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
  pattern used in the DummyJSON-proxying service functions — forwards
  DummyJSON's real status code and message instead of a hardcoded guess.
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
  (Now that SQLite exists, moving the cart into it is a natural future step.)
- **`cartStore.ts` leaves an empty array behind** — removing the last item
  (or clearing) leaves `"<userId>": []` in `cart.json` instead of deleting the
  key. Harmless (reads back as an empty cart); goes away if the cart moves into
  SQLite.
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
- Cart routes dropped `:userId` from the URL entirely (Stage C, done:
  `/api/cart/:userId/...` → `/api/cart/...`) — the server derives the
  authenticated user from the session cookie itself, nothing left to compare
  a URL param against.
- Dependencies: `better-sqlite3` (pinned to `11.9.1`, see above) +
  `@types/better-sqlite3`; `cookie-parser` + `@types/cookie-parser` (added in
  Stage B).

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

**Stage B (auth service / controller / routes on our DB) — ✅ complete,
committed, curl-verified.** Cookie-jar test results: signup sets
`HttpOnly; SameSite=Lax; Path=/; Max-Age=604800` with body `{id, username}`;
`/me` 200 with cookie, 401 without; duplicate signup 409; wrong password and
unknown user return the SAME 401 message; signout 204 + cookie cleared +
exactly one session row deleted; signout with no cookie 204 (no crash).

Lessons from Stage B (don't re-teach from scratch):

- **Layering:** the service returns `{ user, token }` and has no Express types;
  the controller decides the token travels as a cookie. Test: "if a mobile app
  wanted the token in the body, only the controller should change."
- **Shared cookie options:** `SESSION_COOKIE_NAME` + `SESSION_COOKIE_OPTIONS:
CookieOptions` now live in `config/cookie.ts` (moved out of
  `authController.ts` in Stage C so `requireAuth` can import them without
  depending on a controller); `maxAge` is added when
  setting the cookie and left OUT when calling `res.clearCookie(...)` (the
  browser only clears a cookie whose path/sameSite/etc. match). The object must
  be typed `CookieOptions` (import from `'express'`), otherwise `sameSite:
'lax'` widens to `string` and `res.cookie` stops compiling.
- **Cookie gotchas hit:** `path: '/me'` makes the browser send the cookie
  almost nowhere (use `'/'`); `secure: true` breaks plain `http://localhost`
  (currently `false` — **must become `true` / `NODE_ENV === 'production'`
  before any https deploy**); `sameSite: true` means `'strict'` (use `'lax'`).
- **Same 401 message for unknown user and wrong password** — otherwise anyone
  can discover which usernames exist (user enumeration).
- **`signout` must not depend on the session being valid** (a stale/expired
  cookie must still be clearable) and must always send a response — a
  response sent only inside an `if` makes the request hang.
- **`res.cookie()` only sets a header** — you still have to send a body / end.
- **`req.cookies` is typed `any` and is `undefined` until `cookieParser()` is
  registered before the routers** — no compile error warns about it.
- **A cookie that expires can't "call signout"** — the browser silently drops
  it, and HttpOnly means page JS never saw it. The server is the source of
  truth: `findSession` treats an expired row as missing → 401 → client shows
  logged out.
- **Before changing a function, search for its callers.** `getCurrentUser` was
  deliberately kept (and the new function named `getUserFromSession`) because
  the old `requireAuth` still calls it.

Stage B leftovers (small, not blocking):

- The 7-day lifetime is written in 3 places (`sessionStore.ts` + twice in
  `authController.ts`) — should become one shared constant (e.g.
  `SESSION_MAX_AGE_MS`) so cookie and DB expiry can't drift.
- `findSession` could delete an expired row when it finds one (lazy cleanup).
- ~~Unused old DummyJSON types in `types/auth.ts`~~ — deleted in Stage C
  together with `getCurrentUser`.
- `npm install` reported 1 high-severity vulnerability; not investigated yet.

**Stage C (cart uses the session cookie) — ✅ complete, curl-verified
2026-10-26** (all code written by the user, reviewed by the assistant). Story:
"My cart belongs to me; the server finds out who I am from my cookie, not from
a number in the address." What was done:

1. `server/src/types/express.d.ts` — `export {}` + `declare global { namespace
Express { interface Request { userId?: number } } }`.
2. `middleware/requireAuth.ts` rewritten (sync, cookie → `getUserFromSession` →
   `req.userId`); cookie constants moved to `config/cookie.ts`.
3. `utils/validation.ts` got `requireUserId(userId)`; all 5 `cartController.ts`
   handlers call `requireUserId(req.userId)` (the item id still comes from
   `validateNumericParam(req.params.id, 'item id')`).
4. `cartRoutes.ts` is a plain `Router()`; `app.ts` mounts `/api/cart`.
5. Cleanup: `getCurrentUser` + its unused imports and the five old DummyJSON
   auth types deleted; `cart.json` reset to `{}`.

Verified with curl + cookie jars (two users): cart with no cookie / old Bearer
header / fake cookie → 401; alice's add/update/remove/clear all work and are
invisible to bob; duplicate add 409; missing item 404; non-numeric id 400; old
`/api/cart/1` URL → 404; **signout deletes the session row and replaying the
old cookie afterwards → 401**; signout with no cookie → 204; bob stays signed
in when alice signs out. `npx tsc --noEmit` clean.

Lessons from Stage C (don't re-teach from scratch):

- **Declaration merging:** declaring an `interface` with the same name twice
  merges them. Express's own `Request` hangs off the global `Express`
  namespace, so a `.d.ts` file needs `export {}` (make it a module) +
  `declare global { namespace Express { ... } }`. A first attempt that was just
  `export interface Request { userId: string }` compiled but merged with
  nothing — **a passing `tsc` doesn't prove the merge worked**; test with a
  throwaway file that uses `req.userId` on an imported `Request`.
- **`userId` is optional (`?`)** because public routes never set it; the
  guard (`requireAuth`) is what guarantees it on protected routes — TypeScript
  can't know that.
- **Don't use `req.userId!`** — it silences exactly the mistake the guard exists
  to prevent (a new route added without `requireAuth` would silently use
  `undefined` as a cart key). Use the throwing helper `requireUserId` instead.
  A helper returning a **boolean** doesn't narrow the type; one that **returns
  the value or throws** does.
- **401 vs 403:** missing/unknown identity is 401 ("I don't know who you are");
  403 means "I know who you are and you're not allowed". With no `:userId` in
  the URL there is nothing to forbid, so the 403 case disappeared.
- **Check `=== undefined`, not `!userId`** — `!` also rejects `0`; say what you
  mean.
- **A half-migrated controller is a security hole:** after `requireAuth` was
  rewritten but a controller still read `req.params.userId`, any logged-in user
  could read/modify another user's cart via the URL. Change all handlers before
  testing.
- **Express 5 catches errors thrown from sync middleware and rejected
  promises** and forwards them to the error handler; the project still uses
  `try/catch → next(err)` in controllers/middleware purely for consistency.
- **Shared constants go in a neutral file** (`config/cookie.ts`), not in a
  controller that another layer then has to import.
- **Unused imports don't fail `tsc`** in this config — delete them by hand
  (`rg` for the symbol first to confirm no callers).

Stage C leftovers (small, not blocking):

- The 7-day lifetime is still written in 3 places (`sessionStore.ts` + twice in
  `authController.ts`) — make one shared constant.
- Optional hardening: `cookie-parser` turns a cookie value starting with `j:`
  into a parsed JSON object, so `requireAuth`'s `cookie` could be a non-string
  → deep SQLite error → 500 instead of 401. A `typeof cookie !== 'string'`
  check would close it.
- `requireAuth` types `const cookie: string = req.cookies[...]` although it can
  be `undefined` (`req.cookies` is `any`) — harmless but an unenforceable claim.

**Stage D (client auth on the session cookie) — ✅ complete, browser-verified
2026-10-26.** What was done:

1. `authApi.ts`: `getMe` returns `null` on 401 and throws on other failures;
   `signout` is `POST` and returns `Promise<void>`; every auth fetch sends
   `credentials: 'include'`.
2. `AuthContextValue` holds `user` (not `token`/`userId`), `isCheckingAuth`,
   `signIn(user)`, and an async `signOut`.
3. `AuthContext.tsx` checks `/auth/me` on mount and no longer touches
   `localStorage`.
4. `useAuthForm.ts` calls `signIn(data)` for both sign-in and sign-up (sign-up
   auto signs in, because the server's signup already set the cookie) and
   navigates to `/products`.
5. `ProtectedRoute` has three states (loader / redirect / page) and awaits
   `signOut` before navigating. `AuthCard` redirects an already-signed-in
   visit of `/` to `/products`.

Browser-verified: logged-out `/cart` lands on `/` with no error toast; sign-up
lands on `/products`; reload of `/products` stays signed in; visiting `/`
while signed in redirects to `/products`; sign-out returns to `/` and the
session row is gone (`SELECT COUNT(*) FROM sessions` went from 1 to 0).
`npm run lint` is clean. `tsc` fails only in `CartContext.tsx` (Stage E).

Lessons from Stage D (don't re-teach from scratch):

- **Two different "sign in"s.** `loginUser(username, password)` talks to the
  server. `signIn(user)` only tells React who is logged in. The context must
  never see the password.
- **`signIn` takes the user object, not two strings.** `(string, string)`
  compiles even when the caller swaps the arguments (TypeScript compares
  types, not parameter names). One object also matches the `/me` result, so
  login and page-load store the same shape.
- **A 401 from `/me` is "nobody is logged in", not an error.** `getMe` returns
  `null` for 401 and throws for 500/network, so the context can tell them
  apart. The browser still prints a red 401 in the console; that can't be
  turned off.
- **`isCheckingAuth` must start `true`.** If it started `false`, a refresh on
  a protected page would redirect to `/` before `/me` answered (the
  flash-redirect). The flag turns off in `finally`, including when `getMe`
  throws, or the loader never goes away.
- **`signOut` clears UI state only after the server succeeds.** Otherwise the
  page looks signed out while the cookie is still alive, and the next refresh
  signs the user back in.
- **`credentials: 'include'` is required on every cross-origin fetch** that
  should send or receive the cookie (page on `:5173`, API on `:4000`).
  Without it, sign-out reports success and changes nothing.
- **Don't call `response.json()` on a 204.** An empty body isn't JSON, so a
  successful sign-out would throw.

**Stage E (cart client uses the session cookie) — ✅ complete, browser-verified
2026-10-26** (written by the user, reviewed by the assistant). What was done:

1. `cartApi.ts`: `fetchJson` dropped the `token` argument and the
   `Authorization` header, and every cart `fetch` sends
   `credentials: 'include'`. Paths are `GET /cart`, `POST /cart/items`,
   `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`.
   `clearCart` stays outside `fetchJson` because a 204 has no body.
2. `CartContext.tsx` reads only `isAuthenticated` and calls those new
   signatures.
3. `productsApi.ts` was left **without** `credentials: 'include'`. Product
   routes do not use `requireAuth`, so the cookie is not required there.

Browser-verified as `test_stage_e` (then deleted): add item (badge 0 → 1),
increase quantity (badge 2, total $19.98), open `/cart`, reload `/cart` (stays
on the cart after a short loader), clear cart (badge 0, empty message), sign
out back to `/`. `cart.json` showed that user's id with quantity 2 before the
clear, and `"<id>": []` after it (the known empty-key leftover). `tsc` and
`npm run lint` were clean.

Lessons from Stage E (don't re-teach from scratch):

- **Deleting the Bearer header is not enough.** On a cross-origin `fetch`
  (page `:5173`, API `:4000`) the browser sends the cookie only when the call
  says `credentials: 'include'`. Without it the server answers 401.
- **`clearCart` cannot use `fetchJson`.** `fetchJson` always calls
  `response.json()`, and a 204 body is empty, so success would throw.
- **A public route does not need the cookie.** `productsApi.ts` works without
  `credentials: 'include'`. Cart and auth calls do need it.

**Stage F (two signed-in browsers stay isolated) — ✅ verified by the user in
the browser and the DB, 2026-10-26.** Two separate windows (not two tabs: tabs
share one cookie). While both were signed in, `sessions` had `user_id` 12 and
13 (`test21`, `test22`) and `cart.json` held different items for those keys
(Essence Mascara vs Powder Canister). `test1` and `test2` had cart data and
**no** session row: sign-out deletes the session, not the cart.

Lesson: two tabs in one browser are one cookie jar. The second sign-in
replaces the first. Isolation needs a normal window and a private window (or
two browsers, or two curl cookie jars).

**Nothing left in the auth migration (Stages A–F).**

**This summary is the durable record** — the session-memory plan files
mentioned in earlier versions of this doc are cleared when a session ends.
Re-derive specifics from the "Locked decisions" above if resuming this work in
a new session.

## Immediate next steps (pending, not yet decided with the user)

1. Auth migration is done (Stages A–F).
2. Write a dedicated onboarding doc for the team (original end goal of the
   whole exercise) — architecture walkthrough, key TypeScript/React/Express
   concepts demonstrated, setup instructions. Not started yet.
3. Automated tests — none exist yet, client or server.
4. Optional hardening — the "API not versioned" known limitation above, if
   ever needed.
