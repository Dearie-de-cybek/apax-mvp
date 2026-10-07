# APAX assessment notes

Branch: `apax/dearie-eburu`. Frontend and backend sections done, blockchain left out as agreed.

## Read this first: the repo shipped a backdoor

`web/src/controllers/userController.ts` had a `getCookie` IIFE that ran on every backend boot. It base64-decoded a URL and a header from the committed `web/src/config/.config.env`, fetched `https://api.jsonbin.io/v3/b/6a4d1a6ff5f4af5e296cea81`, and ran the response through `new Function("require", ...)`. That is remote code execution on whoever runs `npm run dev`. It is removed in the first commit (`79d7e68`), along with the env file. Dependencies were installed with `--ignore-scripts` and every lockfile entry resolves to registry.npmjs.org.

If anyone ran this repo before that commit, treat that machine as compromised: rotate saved passwords, tokens, SSH keys and move any wallet funds.

## Run it

```bash
cd web
cp src/config/config.env.example .env   # set JWT_SECRET (command is in the file) and MONGO_URI
docker run -d --rm -p 27017:27017 mongo:7
npm ci --ignore-scripts
npm run seed     # demo@apax.local and empty@apax.local, password vault-demo-2026
npm run dev      # Next on :3000, API on :4000
npm test         # auth + holdings tests (node:test, no new deps)
```

## What changed

**Backend**
- `getJWTToken()` signs `{ id, email }` with `JWT_SECRET` and `JWT_EXPIRE`. The server refuses to boot without the secret.
- One token strategy end to end: `Authorization: Bearer <jwt>`. Before, the API set an httpOnly cookie and only read cookies, while the app called it cross-origin without credentials, so the cookie never came back.
- `sendToken` used to return the whole user doc loaded with `+password`, bcrypt hash included. Now it returns id, name, email, role.
- Login rejects non-string credentials (`{"$ne": null}` went straight into `findOne`).
- `connectDatabase()` was never called. It is now, before `listen`.
- Error middleware turns `ErrorHandler`, JWT and Mongoose errors into JSON with the right status. Before, Express answered with an HTML 500.
- CORS is locked to `CLIENT_URL`, JSON bodies are capped at 100kb.
- `GET /api/holdings` (auth required) backed by a `Holding` model: `user`, `asset` (gold | silver | platinum), `amount` in grams, timestamps, unique on user + asset. It always returns all three metals:

```json
{ "success": true, "unit": "g", "holdings": { "gold": 156.75, "silver": 892.4, "platinum": 45.2 }, "updatedAt": "2026-10-07T19:39:22.310Z" }
```

**Frontend**
- Email login calls `POST /user/login`. The button and inputs lock with a spinner while the request is in flight. Failures show an inline alert (`role="alert"`) with different copy for wrong credentials, validation, rate limiting, network down and server errors. Editing a field clears it. Requests time out after 15s.
- On success the token goes into a small persisted zustand store and the vault animation plays into `/dashboard`. The old code pushed to `/dashbaord`.
- `/dashboard` is guarded. No session, or a 401 from the API, sends you to `/login`.
- Holdings come from the API. `HoldingsSection` gives the dashboard a skeleton that matches the real layout, an error card with Try again, and an empty-vault state. The chart no longer divides by zero on an empty portfolio.
- Sign out works, and the sidebar and header show the real user instead of John Doe.
- The 297-line login page is split into `EmailLoginForm` and `VaultDoor`.
- The wallet tab says "coming soon" instead of faking a connection, since wallet auth is blockchain scope.

Checked with `tsc`, eslint, `next build`, 10 unit tests, curl against a real Mongo, and a headless Chrome run through 14 flows (redirect, bad password, network down, loading lock, success, reload, holdings error + retry, sign out, empty vault).

## Task B: moving the dashboard off mocks without a rewrite

What I did for holdings is the pattern for the rest.

1. **Change the store, not the components.** Components already read `useAPAXStore`. I added `fetchHoldings`, `holdingsStatus` and `holdingsError` next to the existing `userHoldings`, and started holdings at zero instead of fake numbers. Every view that reads `userHoldings` (portfolio, zakat, redemption) got real data without being touched.
2. **One boundary per data source.** `HoldingsSection` owns idle/loading, error and empty, and only renders its children when there is real data. Activity gets the same treatment: an `ActivitySection` around the Proof of Reserve timeline, fed by `GET /api/activity?limit=20` and a `fetchActivity` action that replaces `addAuditLog` and the `setInterval` in `app/dashboard/page.tsx`.
3. **States.** Loading is a skeleton shaped like the content, so nothing jumps. Errors show inline with a retry, never a toast you can miss, and never a fake zero, because in a money app $0 and "unknown" are different things. Empty means the API said there is nothing, and it says what will make data appear.
4. **Honest types.** Response shapes live as zod schemas in `web/src/types/*`. The Express handlers are typed against the inferred types, and the client runs `safeParse` on every response, so a contract change becomes a handled error instead of `undefined` in the UI. Next step is moving `src/types` into the existing top-level `shared/` folder once the API gets its own package.

Next in line: replace the simulated price ticker with a server-side price feed (cached, every 30 to 60s), and drive the 24h change and APX-i balance from the API. Both are still mock and marked in the code.

## Security next steps (not added, to avoid new deps)

- `helmet` for headers.
- `express-rate-limit` on `/user/login` and `/user/password/*`, keyed by IP + email.
- Move the JWT to an httpOnly, SameSite=Strict cookie behind a same-origin proxy (Next rewrites), plus short access tokens with refresh. Bearer in localStorage is consistent and works, but it is readable by any XSS.
- Store grams as `Decimal128` or integer milligrams, not floats.
- `forgotPassword` reveals whether an email exists, and `registerUser` uploads to Cloudinary before validating input. Both are worth fixing.
- `next.config.mjs` has `ignoreBuildErrors: true`. I'd turn it off now that `tsc` is clean.
- `app/start.tsx` logs "Apax server startup logic" from the root layout. Harmless, but it has no purpose.

## Week one, if I were shipping this

1. Merge the backdoor removal and rotate anything that ever touched the jsonbin URL.
2. Auth: httpOnly cookie session, rate limit, helmet, register + forgot password working end to end.
3. Holdings and activity live from Mongo, with an append-only ledger collection as the source of truth for balances.
4. Price feed service and real portfolio valuation, so no number on the dashboard is fake.
5. CI running typecheck, lint and tests on every PR.
6. Contract path after that: a permissioned ERC-20 with mint and burn behind the vault ledger, never the other way round.
