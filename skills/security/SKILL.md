---
name: security
description: Security audit of a whole project - secrets, dependency vulnerabilities, auth and access control, input handling, config and deployment risks - ranked by severity. Use for /zeit:security. Read-only; never runs attacks or changes code.
argument-hint: [path]
disable-model-invocation: true
---

# zeit:security

Audit the whole project for security risks. Read-only: do not exploit, do not change code, do not print secret values.

## 1. Map the attack surface

Find, in the project's own code:
- Entry points: HTTP routes, API handlers, CLI commands, webhooks, message consumers, file upload handlers.
- Trust boundaries: where user, network, or file input enters; where it reaches a database, shell, file system, HTML, or another service.
- Auth: login, sessions or tokens, role checks, middleware.
- Config: env files, config files, Dockerfiles, CI workflows, deploy scripts.

Write the list down before checking, so nothing is skipped.

## 2. Run the checks

**Secrets in the repo**
- `git ls-files` (if git exists): flag `.env*`, `*.pem`, `*.key`, `credentials*`, `*.p12`.
- Grep the code for key patterns: `AKIA[0-9A-Z]{16}`, `ghp_[A-Za-z0-9]{36}`, `sk-[A-Za-z0-9]{20,}`, `-----BEGIN .*PRIVATE KEY-----`, and `(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}`.
- Check git history for secrets only if the user asks. It can be slow.
- Report the file and line only. Never print the value. Say to rotate any real secret.

**Dependencies**
- Node: `npm audit --omit=dev` (or `pnpm audit` / `yarn audit`, per lockfile).
- Python: `pip-audit` if installed; otherwise say it is not available.
- Rust: `cargo audit` if installed. Go: `govulncheck` if installed.
- If a tool is missing, say so. Do not install global tools without asking.
- Flag only vulnerabilities in packages the project actually uses, and say whether a fix version exists.

**Auth and access control**
- Every route that changes data: is there an auth check? Is it applied in middleware or inside each handler?
- Role checks: can a normal user reach an admin action? Check for IDs taken from the request and used without an ownership check (IDOR).
- Session and token handling: expiry set, signed or verified, stored in an httpOnly cookie if browser-based, not in `localStorage`.
- Password storage: hashed with bcrypt, scrypt, argon2, or PBKDF2. Flag plain text, MD5, or SHA-1.

**Input handling**
- SQL: string concatenation or template strings with user input in queries. Parameterized queries are fine.
- Shell: `exec`, `system`, `subprocess` with `shell=True`, or `child_process` with user input.
- Paths: user input in file paths without normalization or a base-directory check.
- HTML: `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, or template output without escaping.
- Deserialization: `pickle.loads`, `yaml.load` without a safe loader, `eval`, `new Function`.
- Redirects: user-supplied URLs used directly.
- File uploads: type and size checked, stored outside the web root.

**Web and HTTP**
- CORS: `*` combined with credentials, or reflecting the request Origin.
- Missing security headers on a web app (CSP, HSTS, X-Content-Type-Options, frame protection) if the project serves pages.
- Rate limiting on login and password reset.
- Debug mode, stack traces, or verbose errors enabled in production config.
- Cookies without `Secure`, `HttpOnly`, or `SameSite`.

**Config and deployment**
- Dockerfile runs as root, or uses `latest` tags, or copies `.env` into the image.
- CI workflows with secrets echoed to logs, or `pull_request_target` checking out untrusted code.
- Default passwords or example credentials still in config.
- Ports or admin panels bound to `0.0.0.0` without auth.

**Additional checks**
- **Code written quickly or by AI**: fallback secrets (`|| "changeme"`, default JWT secret), "allow all" defaults (`cors: true`, `ALLOW_ALL`), new routes with no auth decorator, example code copied in with placeholder keys still active.
- **Sensitive data in logs**: `console.log`, `logger.*`, or `print` calls that include passwords, tokens, cookies, card numbers, or full request bodies on auth or payment routes.
- **Supply chain**: GitHub Actions pinned to a tag instead of a commit SHA (`uses: x/y@v2` is a mutable tag); lockfile missing for an app (not a library); dependencies with install scripts that are not known.
- **SSRF**: server code that fetches a URL taken from user input (`fetch(req.body.url)`, `requests.get(user_url)`) with no allow-list.
- **Password reset**: reset tokens must be random, single-use, and expire (check the expiry field and that the token is cleared after use). Reset responses must not reveal whether an email exists.
- **File uploads**: type checked by content (magic bytes) or a safe library, not only by extension or the `Content-Type` header. Filenames sanitized before saving.
- **Sessions**: session ID regenerated after login (prevents session fixation).

## 3. Verify before reporting

Each finding must be backed by a code path you read. Say how an attacker would reach it, in one sentence, without giving exploit steps. If you cannot confirm reachability, label it "unverified".

## 4. Severity rules

Use these so ratings stay the same between runs:
- **High**: reachable by an outsider or a normal user, and leads to data theft, account takeover, code execution, or money loss. Or a leaked live secret.
- **Medium**: needs a specific condition, or affects a limited set of data, or is a hardening gap on a sensitive route.
- **Low**: defense-in-depth, or only reachable by an admin or a logged-in user with no extra power.

## 5. Baseline

- If `SECURITY-BASELINE.md` exists at the project root, read it. Mark each current finding as **new** or **known** (same file, same rule). List new findings first. List findings that disappeared as **fixed**.
- If `$ARGUMENTS` contains `save`, write the current report to `SECURITY-BASELINE.md` with today's date. Do not overwrite without showing the diff first.

## 6. Report

```
Security audit: 2 high, 3 medium, 1 low. Secrets: none found in code.

1. [High] Admin route has no auth check - src/routes/admin.ts:31
   Reach: any logged-in user can call DELETE /admin/users/:id.
   Fix: add the `requireRole('admin')` middleware to the route.

2. [High] Dependency `jsonwebtoken@8.5.1` has a known vulnerability (npm audit)
   Fix: upgrade to 9.0.2. Check for breaking changes in token verification.

3. [Medium] CORS allows any origin with credentials - src/server.ts:12
   Fix: set `origin` to your real frontend URL.

Not checked: git history (ask to run), runtime headers (no server running).
Next: say "fix 1" for a one-line change, or ask for the full list as a plan.
```

Rules:
- Rank by real impact: reachable by an outsider or a normal user first.
- Max 10 findings in full. Group the rest in one line.
- Do not claim the project is "secure". Say what was checked and what was not.
- Never say a secret is safe because it looks like a placeholder without checking.

## 7. Fix mode (only when the user says "fix N")

- Apply only the named finding. Use `/zeit:improve` rules: smallest change, same style.
- Add a test that fails before the fix and passes after, when the project has a test runner for that code.
- Never rotate or revoke a secret yourself. Tell the user the secret must be rotated, and where it is used.
- Run the `/zeit:test` checks and report the result.
- Do not commit unless asked. Use `/zeit:commit` for that.
