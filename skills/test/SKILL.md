---
name: test
description: Run a project's tests, lint, type checks and build, then group every failure by cause and say what to fix first. Use for /zeit:test. Reports only; does not change code unless asked.
argument-hint: [path] [optional: test-name-filter]
disable-model-invocation: true
---

# zeit:test

Find the project's real checks, run them, and report what fails. Do not edit code while testing.

## 1. Find the checks

Read the manifest and config files. Use what the project already defines, in this order:

- **Node**: `package.json` scripts named `test`, `lint`, `typecheck`, `check`, `build`. Use the lockfile to pick the package manager (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, else `npm`).
- **Python**: `pytest` (if `tests/` or `test_*.py` exists), `ruff`/`flake8`, `mypy`/`pyright` if configured.
- **Rust**: `cargo test`, `cargo clippy`. **Go**: `go test ./...`, `go vet ./...`.
- **Remotion/Vite/Next**: also run the build command.

If `$ARGUMENTS` has a path or filter, narrow the run to it.

If there are no tests at all, say so in one line and stop. Offer to add a minimal test file. Do not invent tests silently.

## 2. Make sure dependencies exist

If `node_modules`, `.venv`, or the equivalent is missing, install from the lockfile first. Say what you installed.

## 3. Run each check

Run them one at a time, not in parallel, so failures are easy to attribute. Capture the exit code and the failing lines. Use a timeout of 10 minutes for each.

## 4. Report

Use this format:

```
Result: 3 of 4 checks pass. Test suite fails.

Failures grouped by cause:
1. Missing env var `API_URL` - 6 tests (auth.spec.ts, api.spec.ts)
   Fix: set `API_URL` in `.env.test`
2. Type error `User.id` is `string`, code expects `number` - 2 errors
   Fix: `src/user.ts:14`, change the type to `string`

Fix first: #1. It likely clears most failures.
Next: say "fix 1" and I'll make the change.
```

Rules for the report:
- Quote each error exactly, shortest line that explains it.
- Group by cause, not by file. Rank by how many failures each cause explains.
- Mark flaky results as flaky only if a rerun passes. Rerun once to check.
- Never say "all tests pass" unless every check ran and exited 0.

## 5. Never

- Edit a test to make it pass, delete a failing test, or add `skip` or `xfail` without asking.
- Run destructive commands (database resets, deploys, `git clean`) to get a test to run.
