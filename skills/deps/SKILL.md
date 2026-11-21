---
name: deps
description: Check outdated, vulnerable and unused dependencies, group upgrades by risk (patch, minor, major), and optionally apply the safe ones with tests after each group. Use for /zeit:deps. Reports by default; upgrades only when asked.
argument-hint: [path] [optional: "upgrade safe"]
disable-model-invocation: true
---

# zeit:deps

Keep dependencies current without breaking the project. Report first. Upgrade only when asked.

## 1. Detect the package manager

Use the lockfile: `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (yarn), `bun.lockb` (bun), `poetry.lock` or `uv.lock` (Python), `Cargo.lock` (Rust), `go.sum` (Go). Use only that manager's commands.

## 2. List what is outdated

- npm: `npm outdated --json`. pnpm: `pnpm outdated --format json`. yarn: `yarn outdated`.
- Python: `pip list --outdated --format json` (or `uv pip list --outdated`).
- Rust: `cargo outdated` if installed. Go: `go list -m -u -json all`.
- If the tool is missing, say so and skip that step.

For each package, record current version, latest version, and the semver change.

## 3. Check security

Run the audit for the manager (`npm audit --omit=dev`, `pip-audit`, etc.). List only vulnerable packages that are actually installed. For a full audit, use `/zeit:security`.

## 4. Find unused packages

Grep each dependency name in `src/` (or the project's source folders) and in config files. Packages with no import and no config reference are unused. Ignore build tools and CLIs used only from scripts (check `package.json` scripts first).

## 5. Group by risk

- **Safe**: patch updates (x.y.Z), and security fixes of any size.
- **Usually safe**: minor updates (x.Y.z). Check the changelog for deprecations.
- **Breaking**: major updates (X.y.z). Read the migration notes before touching them.

## 6. Report

```
Outdated: 14 packages. Vulnerable: 2 (high). Unused: 1.

Safe to upgrade now (patch/security), 6 packages:
- jsonwebtoken 9.0.0 -> 9.0.2 (security fix)
- zod 3.22.1 -> 3.22.4

Minor, check changelog, 5 packages:
- react-router 6.20 -> 6.28

Major, one at a time, 3 packages:
- vite 4 -> 6 (config changes needed, see migration guide)

Unused: `moment` (no imports). Remove?
Next: say "upgrade safe" to apply the first group.
```

## 7. Apply upgrades (only when asked)

Run only when the user says "upgrade safe" or names packages.

1. Make sure the working tree is clean (`git status`). If not, stop and ask.
2. Upgrade the safe group with the manager's command. Let the manager update the lockfile. Do not edit the lockfile by hand.
3. Run the checks from `/zeit:test`: tests, type check, lint, build.
4. If the checks pass, show the changed versions and stop there. Commit with `/zeit:commit` only if asked.
5. If a check fails, revert the upgrade (`git checkout -- package.json <lockfile>`), report the failing check with its exact error, and skip that package.
6. Major upgrades: one package per run. Read its changelog first and show the user the required changes before editing code.

Never remove unused packages without approval.
