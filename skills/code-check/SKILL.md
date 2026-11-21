---
name: code-check
description: Code health check for a project - lint and type results, dead code, duplication, oversized files and functions, unused dependencies, and leftover TODOs - ranked by how much each costs. Use for /zeit:code-check. Read-only; does not change code.
argument-hint: [path]
disable-model-invocation: true
---

# zeit:code-check

Measure code health, not bugs. For bugs use `/zeit:review`. Read-only.

## 1. Run the project's own tools

Use the checks already defined in the project (see `/zeit:test` step 1): lint, type check, formatter in check mode. Record the counts, not every line. Group by rule.

If no lint or type config exists, say so and recommend one. Do not add one without asking.

## 2. Find the hot spots

- **Big files**: over 500 lines. List the top 5 with line counts.
- **Big functions**: over 80 lines, or more than 4 levels of nesting. Use the language's own tool if it exists (`eslint` `max-lines-per-function`, `radon cc` for Python). Otherwise estimate from the code and say it is an estimate.
- **Duplication**: look for the same block of 10+ lines in two or more places. Use `jscpd` or `pylint duplicate-code` only if installed.
- **Dead code**: exports, functions, and files never imported anywhere. Verify by grepping the name across the project before reporting. Exclude entry points and framework conventions (pages, routes, `index` files).
- **Unused dependencies**: listed in the manifest but never imported. Use `depcheck` (Node) if installed; otherwise grep the imports yourself.
- **Leftovers**: `TODO`, `FIXME`, `XXX`, `console.log`, `print(` debugging, commented-out blocks longer than 5 lines. Count them and show the 5 oldest or most serious.
- **Naming and consistency**: mixed naming styles in one folder (camelCase and snake_case in the same module), mixed error-handling patterns.

## 3. Check the tests exist

- Count test files versus source files per main folder. Note folders with no tests.
- Do not judge test quality here. That is `/zeit:review`'s job.

## 4. Report

```
Health: lint 0 errors, 14 warnings. Types pass. Formatter: 3 files differ.

Costs, most expensive first:
1. Duplication: the date formatter is copied in 4 files
   (`utils/date.ts`, `lib/format.ts`, `app/feed.tsx:8`, `app/post.tsx:11`).
   Fix: keep one in `lib/format.ts`, import it everywhere.
2. Oversized: `src/api/handlers.ts` is 1,240 lines, 9 handlers.
   Fix: split by resource (users, orders, billing). Not urgent.
3. Dead: `legacyExport()` in `src/export.ts:3` is never called.
   Fix: delete it. Verified by grep, no references.
4. Unused dep: `moment` in package.json, no imports.
   Fix: remove it.
5. Leftovers: 23 TODO comments, oldest from 2023.

Test coverage by folder: `src/billing/` has no tests.
Next: say "fix 3 and 4" for the safe deletions, or ask for a plan for the rest.
```

Rules:
- Show each cost as a number and a location, so it can be checked.
- Mark estimates as estimates.
- Put safe deletions (verified dead code, unused deps) first, since they are the quickest wins.
- Max 10 items. Group the rest in one line.
- Do not recommend rewriting working code just for style.
