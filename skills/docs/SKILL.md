---
name: docs
description: Check that README and setup docs match the real code - scripts, env vars, routes, file paths and ports - and list stale or missing items. Use for /zeit:docs. Reports by default; edits docs only when asked with "fix".
argument-hint: [path] [optional: "fix"]
disable-model-invocation: true
---

# zeit:docs

Make the docs tell the truth. Only the documentation changes, never the code. Never invent features.

## 1. Collect the docs

Read: `README.md`, everything in `docs/`, `CONTRIBUTING.md`, `.env.example` (or any env template), and the top of `CHANGELOG.md` if present.

## 2. Extract the claims

Pull out every checkable statement:
- Install commands (`npm install`, `pip install -r ...`)
- Run and test commands (`npm run dev`, `pytest`)
- Environment variables named in the docs
- Config options and their defaults
- API routes or CLI flags listed
- File paths and folder names mentioned
- Ports and URLs
- Required versions (Node 20, Python 3.11)

## 3. Verify each claim against the code

- Scripts: each command's script exists in `package.json` (or the Makefile or task file) and is spelled the same.
- Env vars: grep the code for `process.env.X`, `os.environ`, `os.getenv`, or the framework's config reader. A var in the docs but not in code is stale. A var in code but not in the docs is missing.
- Routes: grep the route definitions. A documented route that does not exist is stale.
- Paths: check each mentioned file or folder exists.
- Ports: match the dev server config and any `.env` default.
- Versions: match `engines`, `.nvmrc`, `.python-version`, or `pyproject.toml`.

Run install or run commands only if the user asks. Do not run anything that starts a server or writes data.

## 4. Report

```
Checked 18 claims. Stale: 3. Missing: 2.

Stale:
1. README.md:24 says `npm run start`. package.json has no `start` script. Dev script is `npm run dev`.
2. README.md:41 lists `DATABASE_URL`. Code reads `DB_URL` (src/db.ts:6).
3. docs/api.md:12 documents `GET /v1/users`. Route is `GET /api/users`.

Missing:
1. `STRIPE_WEBHOOK_SECRET` is read in src/billing/webhook.ts:9 but not in .env.example.
2. Node 20 required (.nvmrc) but README does not say so.

Next: say "fix" to update the docs to match the code.
```

## 5. Fix (only with "fix")

- Edit only the documentation files you checked.
- Change the wrong fact to match the code. Do not change the code to match the docs.
- Keep the author's wording and structure. Change only the lines that are wrong.
- Add missing env vars to `.env.example` with a placeholder value, never a real secret.
- Show the diff summary at the end. Do not commit unless asked.

If the code itself looks wrong (a documented feature is missing on purpose or by mistake), say so and ask. Do not decide for the user.
