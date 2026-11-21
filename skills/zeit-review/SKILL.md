---
name: zeit-review
description: Review a file, folder, diff or branch for real bugs, security holes and error-handling gaps, and list fixes ranked by impact. Use for /zeit-review. Reports only; does not change code.
argument-hint: [path | branch | "diff"]
disable-model-invocation: true
---

# zeit-review

Find problems that matter and ignore style preferences. Do not edit code.

## 1. Pick the scope

- `$ARGUMENTS` is a path: review those files.
- `$ARGUMENTS` is `diff` or empty: review `git diff` plus staged changes. If there is no diff, ask which path to review.
- `$ARGUMENTS` is a branch: review `git diff main...<branch>` (or the default branch).

Read the full file for each changed hunk. A diff alone hides context.

## 2. Check, in this order

1. **Correctness**: wrong logic, off-by-one, wrong comparison (`<` vs `<=`), null or undefined paths, race conditions, unhandled promise or async errors, wrong return values.
2. **Input and trust**: unvalidated user input, SQL or shell injection, path traversal, XSS (unescaped HTML), secrets in code, unsafe `eval`, missing auth checks on new routes.
3. **Data safety**: writes without a transaction, deletes without a confirm or backup path, migrations that drop data.
4. **Errors**: swallowed errors (empty `catch`), errors that leak internals to users, missing timeouts on network calls.
5. **Edge cases**: empty input, very large input, duplicate submits, offline or slow network, first run with no data.
6. **Maintainability** (only if it causes a real bug risk): duplicated logic that already diverged, dead code that is still called.

Skip: formatting, naming preferences, comments, and "could be cleaner" unless a bug follows from it.

## 3. Verify before reporting

Each finding must be real. Before listing it, confirm it by reading the code path that reaches it. If you cannot show how it breaks, drop it or mark it "unverified".

## 4. Report

Max 10 findings, most severe first:

```
1. [High] Login accepts expired tokens - src/auth.ts:42
   Breaks when: token exp equals now (`<=` missing).
   Fix: change `<` to `<=` on line 42.

2. [Medium] Unhandled rejection in upload - src/upload.ts:88
   Breaks when: S3 is down. Server crashes.
   Fix: wrap the await in try/catch and return 503.

Fix first: #1 (one line, security-relevant).
Next: say "fix 1" and I'll make the change.
```

If nothing serious is found, say so in one line and list what you checked.
