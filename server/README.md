# ShopCart Server

Node + TypeScript + Express backend (BFF) for the ShopCart app.

Accounts and sessions live in SQLite (`server/data/app.db`). The cart is a
JSON file (`server/data/cart.json`), keyed by user id. Product routes proxy
[DummyJSON](https://dummyjson.com). Sign-in sets an HttpOnly `session`
cookie. Cart routes read that cookie and do not take a user id in the URL.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` needs `PORT` (4000), `THIRD_PARTY_BASE_URL` (`https://dummyjson.com`),
and `CLIENT_ORIGIN` (`http://localhost:5173`). The dev server restarts when
source files change.

`better-sqlite3` is pinned to `11.9.1` and `typescript` to `5.7.3`. Newer
releases of both fail on the Node 18 machine this project was built with.
See [HANDOFF.md](../HANDOFF.md).

| Script | What it does |
|---|---|
| `npm run dev` | Run the API with reload |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled server |

## Endpoints

All paths are under `/api`. Auth and cart calls need the `session` cookie
(`credentials: 'include'` from the browser). Product calls do not.

| Method | Path | Result |
|---|---|---|
| POST | `/auth/signup` | 200 `{ id, username }` and a session cookie. 409 if the username is taken |
| POST | `/auth/signin` | 200 `{ id, username }` and a session cookie. 401 for a bad username or password, with the same message either way |
| POST | `/auth/signout` | 204. Deletes the session if the cookie is present, and always clears the cookie |
| GET | `/auth/me` | 200 `{ id, username }`, or 401 |
| GET | `/products` | Product list. Supports `?limit=&skip=` |
| GET | `/products/:id` | One product |
| GET | `/cart` | `{ items, total }` for the signed-in user |
| POST | `/cart/items` | Body `{ id, quantity }`. 409 if that product is already in the cart |
| PATCH | `/cart/items/:id` | Body `{ quantity }` |
| DELETE | `/cart/items/:id` | Removes one item. 404 if it is not in the cart |
| DELETE | `/cart` | 204. Clears the cart |

A cart call with no cookie, or with an expired cookie, is 401.

## Viewing the database

The auth data lives in one SQLite file, `server/data/app.db` (tables: `users`,
`sessions`; `sqlite_sequence` is SQLite's internal id counter). The `sqlite3`
CLI is pre-installed. The cart is **not** in the DB — it's the flat file
`server/data/cart.json` (`cat data/cart.json`). Run everything below from
`server/`. All of these are read-only `SELECT`s.

### Quick one-liners (no prompt needed)

```bash
# list tables
sqlite3 data/app.db ".tables"

# all users
sqlite3 -header -column data/app.db "SELECT id, username FROM users;"

# all sessions, with readable expiry
sqlite3 -header -column data/app.db "SELECT token, user_id, datetime(expires_at/1000,'unixepoch') AS expires FROM sessions;"

# who is signed in right now
sqlite3 -header -column data/app.db "SELECT u.id, u.username, datetime(s.expires_at/1000,'unixepoch') AS expires FROM sessions s JOIN users u ON u.id = s.user_id;"

# the full users table, including hash and salt
sqlite3 -header -column data/app.db "SELECT * FROM users;"

# table definitions
sqlite3 data/app.db ".schema"
```

### Interactive mode

```bash
sqlite3 data/app.db
```

Then, inside the prompt:

```
.headers on
.mode column
.tables
SELECT * FROM users;
SELECT * FROM sessions;
.quit
```

## Clearing the data

Run from `server/`. `DELETE` can't be undone, so look first and (if unsure)
back the file up:

```bash
# 1. look before you delete
sqlite3 -header -column data/app.db "SELECT * FROM sessions;"
sqlite3 -header -column data/app.db "SELECT id, username FROM users;"

# optional safety copy
cp data/app.db data/app.db.bak
```

`sessions.user_id` points to `users.id`, so delete **children first**
(sessions), then parents (users). `DELETE FROM table;` with no `WHERE` removes
every row; the table itself stays.

```bash
# 2. delete everything
sqlite3 data/app.db "DELETE FROM sessions;"
sqlite3 data/app.db "DELETE FROM users;"

# 3. optional: restart user ids from 1 (only when `users` is empty)
sqlite3 data/app.db "DELETE FROM sqlite_sequence WHERE name = 'users';"

# 4. confirm (both should print 0)
sqlite3 data/app.db "SELECT COUNT(*) FROM users;" "SELECT COUNT(*) FROM sessions;"
```

To delete only some rows, add a `WHERE` (run it as a `SELECT` first to check
it matches what you expect):

```bash
# only the test users (and their sessions)
sqlite3 data/app.db "DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_%');"
sqlite3 data/app.db "DELETE FROM users WHERE username LIKE 'test_%';"

# one specific user
sqlite3 data/app.db "DELETE FROM users WHERE id = 6;"

# sign everyone out but keep the accounts
sqlite3 data/app.db "DELETE FROM sessions;"
```

The cart is **not** in the DB, so none of the above touches it. Reset it to an
empty JSON object — not an empty file, because `JSON.parse('')` throws:

```bash
echo '{}' > data/cart.json
```

Clear the cart file together with the users: its keys are user ids, and ids
restart from 1 after step 3, so a new user could otherwise inherit an old cart.

## Gotchas

- SQL statements end with `;` (`SELECT * FROM users;`). A statement without it
  leaves the prompt stuck on `...>` waiting for more input, and anything typed
  next (even `quit`) becomes part of that statement. Type `;` to finish it, or
  `Ctrl+C` to cancel.
- SQLite's own commands start with a dot and need no `;`: `.quit`, `.tables`,
  `.schema`. `quit` without the dot is not a command. `Ctrl+D` also exits.
- `sessions.token` is the value of the browser's `session` cookie — treat it
  like a password. `expires_at` is a timestamp in **milliseconds**, hence
  `/1000` in the queries above.
- `DELETE` / `UPDATE` / `DROP` change real data. `DELETE FROM sessions;` is the
  safe way to sign everyone out.
- When curl-testing from this machine, use `http://127.0.0.1:4000`, not
  `localhost` — the machine's `no_proxy` lists `127.0.0.1` but not `localhost`,
  so curl routes `localhost` through the proxy and gets an empty `503`.
