# ShopCart Server

Node + TypeScript + Express backend (BFF) for the ShopCart app.

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
