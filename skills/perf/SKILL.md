---
name: perf
description: Find performance problems in a web frontend or backend - large bundles, slow renders, N+1 queries, unbounded lists, blocking calls - and rank them by expected impact. Use for /zeit:perf. Reports only; does not change code.
argument-hint: [path] [optional: url]
disable-model-invocation: true
---

# zeit:perf

Find the slow parts and rank them by likely impact. Read-only. Only send GET requests when measuring; never write data or load-test.

## 1. Identify what runs

- Frontend: `package.json` with a build script, `vite.config`, `next.config`, `remotion` or other UI framework.
- Backend: route handlers, controllers, ORM queries, background jobs.
- Both: check both.

## 2. Measure what you can

- **Build size (frontend)**: run the build script. Read the output for the largest JS and CSS chunks. Report sizes in KB.
- **Lighthouse (frontend)**: only if a URL is given or the dev server is already running. Run `npx lighthouse <url> --only-categories=performance --quiet` if available. If not available, skip and say so.
- **Endpoint timing (backend)**: only if the server is running. Time GET requests with `curl -o /dev/null -s -w "%{time_total}\n" <url>` a few times. Never time POST, PUT, or DELETE.
- If nothing can be measured, say the review is code-only and label estimates as estimates.

## 3. Check the code

**Frontend**
- Heavy imports for small uses: `lodash` (whole package), `moment`, icon packs imported as a whole, large libraries imported in the top-level bundle when only one page needs them.
- No code splitting for routes: all pages in one bundle with no `lazy` or dynamic `import()`.
- Images: over 300 KB, no width or height set (causes layout shift), no lazy loading below the fold.
- Fonts: loaded without `font-display`, or many weights loaded for a few styles.
- Effects that run on every render or have a missing dependency array, causing repeated fetches or loops.
- Large lists rendered without virtualization or pagination (over ~200 items).
- Scripts that block rendering in the HTML head.

**Backend**
- N+1: a database or API call inside a loop over results. Fix is a batch query or a join.
- Unbounded queries: `findMany`, `SELECT`, or `find` with no `limit` or pagination on list endpoints.
- Missing indexes: `WHERE` or `ORDER BY` on columns that have no index in the migrations or schema. Check the schema file.
- Synchronous file or crypto work inside request handlers (`readFileSync`, `pbkdf2Sync`).
- Expensive work repeated per request with no cache (same external API call every time).
- External calls with no timeout.
- Sequential `await` calls that could run in parallel (`Promise.all`) when they do not depend on each other.

## 4. Verify before reporting

Each finding must cite a file and line you read. For queries, confirm the query is on a hot path (a route that is called often, not a one-time script).

## 5. Report

```
Measured: main bundle 612 KB gzip (build). Endpoint GET /api/orders: 1.8 s average (3 runs).
Estimates are marked (est.).

Ranked by impact:
1. [High] N+1 on orders list - src/api/orders.ts:34
   Each order makes one query for its customer. 50 orders = 51 queries.
   Fix: join customers in the first query.
2. [High] Whole `lodash` imported - src/utils/format.ts:1
   Adds ~70 KB gzip to the main bundle (est.).
   Fix: import only `debounce` from `lodash/debounce`.
3. [Med] No route splitting - src/App.tsx:8
   Fix: `lazy()` the admin pages.

Not measured: real database timing (no DB running).
Next: say "fix 1" to apply a single change, or ask for the full list as a plan.
```

Rules:
- Rank by user impact times how often the code runs.
- Max 10 items. Group the rest.
- Never claim a speed number you did not measure. Mark estimates.
- Do not suggest micro-optimizations that save under 1 ms or 1 KB.
