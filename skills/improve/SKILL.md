---
name: improve
description: Pick the single most important problem in one file, component or page, make the smallest safe fix, run the checks, and show the diff. Use for /zeit:improve. Asks before any large change.
argument-hint: <path> [optional: what to improve]
disable-model-invocation: true
---

# zeit:improve

Make one small, safe, verified improvement. Do not rewrite.

## 1. Set the target

`$ARGUMENTS` gives the path and optionally the goal. If no goal is given, pick the highest-impact issue from:
1. A bug or crash (fix first, always).
2. A security or data-loss risk.
3. A failing test or type error in that file.
4. A UI problem from the design rules in `/zeit:design-check`.
5. Dead or duplicated code in that file.

Name the chosen problem in one line before editing.

## 2. Check the baseline

Run the project's tests or checks that touch the target (`/zeit:test` steps). Record what already fails so you do not blame your change for it.

## 3. Make the smallest fix

- Change only what the problem needs. Keep the public API, names, and behavior the same unless the goal says otherwise.
- Match the file's existing style, naming, and patterns.
- Keep existing comments unless they are wrong.
- If the fix needs more than about 50 changed lines, or touches more than 3 files, stop and show the plan. Ask before continuing.
- Never change tests to match broken behavior.

## 4. Verify

Run the same checks as step 2. Compare against the baseline:
- Same failures as before: fine, say they are pre-existing.
- New failure: fix it or revert your change. Do not leave it broken.

For UI changes, if a dev server is running or easy to start, check the page at 375px and 1280px wide.

## 5. Report

```
Problem: `Cart.tsx` recalculates total on every render and shows NaN for empty cart.
Change: `src/Cart.tsx` lines 12-18. Guard empty array, memoize total.
Checks: tests 42/42 pass (baseline: same). Build passes.

Diff:
- const total = items.reduce(...)
+ const total = useMemo(() => items.reduce(...) ?? 0, [items])

Undo: `git checkout -- src/Cart.tsx`
```

Then one line: the next most important issue, as a question.
