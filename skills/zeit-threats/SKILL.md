---
name: zeit-threats
description: Threat model one feature (login, signup, payment, upload, reset, admin, webhook, etc.) - map its data flow, apply STRIDE and feature-specific abuse cases, check which controls exist in code, and list gaps. Use as /zeit-threats <feature>. Read-only unless "save" or "fix" is passed.
argument-hint: <feature> [optional: save | fix]
disable-model-invocation: true
---

# zeit-threats

Find out what could go wrong with one feature, and whether the code already stops it. Think before code is written, not only after. Read-only unless told otherwise.

## 1. Pick the feature

- `$ARGUMENTS` names the feature (`login`, `checkout`, `upload`, `reset`, `admin`, `webhook`, `signup`, `search`, `download`, `api-keys`). Match it to routes, pages, handlers, and tables in the code (grep the name and its synonyms, e.g. `login`, `signin`, `auth`, `session`).
- If `$ARGUMENTS` is empty, list the features you found in the project (one line each) and ask which one.
- If more than one place matches, list them and ask which one to model. Do not mix features.

## 2. Map the flow

Write the flow in order, from the entry point to storage:
- **Entry points**: routes, forms, handlers, webhooks.
- **Actors**: normal user, logged-in user, admin, anonymous attacker, third-party service.
- **Assets**: what must be protected here (passwords, sessions, personal data, payment data, money, files, admin power).
- **Trust boundaries**: where data crosses from the browser, the network, a third party, or a less-trusted part of the code into a more-trusted part.

Show the flow as a numbered list or a Mermaid `flowchart` with the boundaries marked.

## 3. Apply STRIDE to each entry point

For each entry point, consider each category. Write "n/a" if it does not apply:

| Category | Question |
|---|---|
| **S**poofing | Can someone pretend to be another user or service? |
| **T**ampering | Can data be changed in transit or at rest without detection? |
| **R**epudiation | Can someone do a sensitive action with no record of it? |
| **I**nformation disclosure | Can someone read data they should not see (including through error messages or timing)? |
| **D**enial of service | Can someone make it slow, expensive, or unavailable? |
| **E**levation of privilege | Can a normal user reach admin or another user's data? |

## 4. Add feature-specific abuse cases

Use the checklist for the feature type. Skip items that do not apply.

**Login**: credential stuffing and brute force (rate limit, lockout or backoff), account enumeration (same message and timing for unknown user), session fixation (new session ID after login), session cookie flags (`HttpOnly`, `Secure`, `SameSite`), session expiry and logout that really ends the session, MFA bypass, open redirect after login (`?next=` allow-list), failed-login logs without passwords.

**Signup**: enumeration of existing emails, bot signups (captcha or rate limit), weak password rules, email verification before full access, mass assignment (client sends `role: "admin"`).

**Password reset**: reset token is random, single-use, expires; response does not reveal if the email exists; token not logged; reset also ends existing sessions.

**Payment / checkout**: client-supplied price or amount trusted, webhook signature verified, order marked paid only by the server-side event, idempotency for retries, duplicate charge on double submit.

**Upload**: type checked by content, size limit, filename sanitized, stored outside the web root, not executable, antivirus or scanning if files are shared.

**Admin**: every admin route checks the role server-side (not only hidden in the UI), audit log of admin actions, no default admin account.

**Webhook**: signature verified before parsing, replay protection (timestamp or event ID stored), handler is idempotent.

**Download / file access**: IDOR (a file ID from another user works), signed URLs expire, path traversal in the file name.

**API keys / tokens**: shown once, stored hashed, scoped, revocable, rate limited.

**Search**: SQL or NoSQL injection in filters, unbounded results, search over data the user should not see.

## 5. Check each threat against the code

For every threat you listed, find the control in code and read it. Use one status:
- **Mitigated**: the control exists and you read it (cite `file:line`).
- **Partial**: the control exists but misses a case (say which case).
- **Missing**: no control found after searching (say what you searched for).
- **n/a**: the threat does not apply here, with the reason.

Do not mark Mitigated from the name of a function or a comment. Read the code that does the check.

## 6. Report

```
Feature: login (3 entry points: POST /login, POST /login/mfa, GET /reset)
Assets: passwords, session cookie, account email.

| Threat | Status | Where / gap |
|---|---|---|
| Brute force on POST /login | Missing | No rate limit found in routes or middleware |
| Account enumeration | Partial | Same message, but 404 for unknown users (login.ts:31) |
| Session fixation | Mitigated | Session regenerated at login.ts:48 |
| Session cookie flags | Mitigated | httpOnly, secure, sameSite=lax (session.ts:12) |
| Open redirect via ?next= | Missing | next used directly in redirect (login.ts:60) |

Gaps, most serious first:
1. Brute force (High): add a rate limit of 5 attempts per 15 min per email and IP on POST /login.
2. Open redirect (Medium): allow only paths starting with `/` and no `//`.
3. Enumeration (Low): return the same status and timing for unknown users.

Not checked: the MFA code path (not found in code).
Next: say "fix 1" to apply a fix, or "save" to write docs/threats/login.md.
```

## 7. Save or fix

- `save`: write the table and gaps to `docs/threats/<feature>.md` with today's date. Show the file path. Do not overwrite an existing file without showing the diff first.
- `fix N`: apply one gap at a time, with the smallest change and a test where the project has tests. Never rotate secrets yourself. Run the `/zeit-test` checks and report the result. Do not commit unless asked.

## Rules

- Be concrete: name the attacker action in one sentence, not "an attacker could compromise the system".
- Do not invent controls. If you did not find it, it is Missing.
- Keep to the feature. Mention a problem in another feature only as one line at the end.
- Max 12 threats in the table. Group the rest.
