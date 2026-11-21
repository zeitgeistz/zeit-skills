---
name: zeit-release
description: Pre-release checklist - clean tree, checks pass, version chosen from commits, changelog drafted, tag created locally. Stops before pushing or publishing. Use for /zeit-release.
argument-hint: [optional: major | minor | patch | x.y.z]
disable-model-invocation: true
---

# zeit-release

Prepare a release and stop before anything is published. Pushing, publishing, and deploying need the user's explicit approval.

## 1. Check the starting point

- `git status`: working tree must be clean. If not, stop and list the files.
- Current branch must be the default branch (`main` or `master`). If not, stop.
- `git fetch` and confirm the branch is not behind its remote. If behind, stop.
- Find the last tag: `git describe --tags --abbrev=0`. If there is no tag, use the first commit as the base and say so.

## 2. Run the checks

Run every check from `/zeit-test`: tests, type check, lint, and build. All must exit 0. Also run the high-severity audit only (`npm audit --omit=dev --audit-level=high` or the equivalent). If any check fails, stop and report it.

## 3. Choose the version

Read commits since the last tag (`git log <tag>..HEAD --oneline`).
- Any `BREAKING CHANGE` or `!` in a type: **major**.
- Any `feat`: **minor**.
- Only `fix`, `perf`, `refactor`: **patch**.
- If `$ARGUMENTS` gives a level or version, use that instead, and say so.

Show the current version, the suggested next version, and the reason. Ask the user to confirm before continuing.

## 4. Draft the changelog

Group commits since the last tag under: Added, Changed, Fixed, Removed, Security. Write each entry as one short line in the user's words, not the raw commit message. Drop chore and docs entries unless they matter to users.

Show the draft. Write `CHANGELOG.md` only after the user approves. Put the newest entry at the top.

## 5. Bump the version

Update the version in the manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, etc.) and any lockfile version field. Show the diff. Apply it only after approval.

## 6. Commit and tag locally

```bash
git add <manifest> CHANGELOG.md
git commit -m "chore(release): vX.Y.Z

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
git tag -a vX.Y.Z -m "vX.Y.Z"
```

Do not push. Do not run `npm publish`, `gh release create`, or any deploy command.

## 7. Report and stop

```
Ready: v1.4.0 tagged locally at a1b2c3d. Checks: all pass.
Not pushed, not published.
Next, only if you approve:
  git push origin main --follow-tags
  gh release create v1.4.0 --notes-file <changelog excerpt>
Undo: git tag -d v1.4.0 && git reset --soft HEAD~1
```
