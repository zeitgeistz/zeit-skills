---
name: zeit-debug
description: Reproduce a bug from an error or description, rank the likely causes, confirm the real one with evidence, and propose a minimal fix with a regression test. Use for /zeit-debug. Does not edit code until the user says "fix".
argument-hint: <error text, log, or description> [optional: "fix"]
disable-model-invocation: true
---

# zeit-debug

Find the cause before touching code. Evidence first, fix second.

## 1. Gather the facts

From `$ARGUMENTS` and the conversation, collect:
- Exact error text or log lines (copy them, do not paraphrase).
- Steps to trigger it.
- Expected result and actual result.
- When it started: check `git log --oneline -20` and whether it worked before a known commit.

If the steps or error are missing, ask for them in one short question. Do not guess the bug.

## 2. Reproduce

- Find the smallest command, test, or request that triggers the bug. Prefer an existing test. If none, write a throwaway script in a temp location, not in the project.
- If you can reproduce it, record the exact command and output.
- If you cannot, say what blocks it (missing env var, data, service) and ask for that. Do not claim a root cause without a reproduction or direct evidence.

## 3. Rank hypotheses

List 2–3 causes, most likely first. For each, write the one check that would confirm or rule it out:

```
1. Expired token compared with `<` instead of `<=` (src/auth.ts:42)
   Check: run the test with exp = now. If it fails, confirmed.
2. Clock skew between servers
   Check: compare `date` on both hosts.
```

## 4. Test each hypothesis

- Run the checks in order, cheapest first. Reading code is cheapest.
- If you must add logging, mark each line with `// zeit-debug: remove` and remove them all before reporting. Confirm with `grep -r "zeit-debug: remove"` that none are left.
- If it is a regression, bisect: `git bisect start`, mark bad and good, and run the reproduction at each step. Always run `git bisect reset` at the end, even on failure.

## 5. Report the cause

```
Cause: token check uses `<` so tokens expiring now are accepted as valid.
Evidence: test `auth.spec.ts:58` fails when exp = now (output below).
Confidence: high. Reproduced.

Other causes ruled out:
- Clock skew: both hosts within 50 ms.

Fix (not applied): change `<` to `<=` on src/auth.ts:42.
Next: say "fix" to apply it with a regression test.
```

If you could not confirm a cause, say so, list what was ruled out, and name the single piece of information that would settle it.

## 6. Fix (only with "fix")

- Make the smallest change that removes the cause. Follow `/zeit-improve` rules.
- Add a regression test that fails before the fix and passes after. Show that it failed first.
- Remove every `zeit-debug: remove` line.
- Run `/zeit-test` checks. Report the result.
- Do not commit unless asked. Use `/zeit-commit` if the user wants it committed.
