---
name: zeit-commit
description: Review staged changes for secrets, debug leftovers and mixed topics, then write a Conventional Commits message and commit locally. Use for /zeit-commit. Never pushes.
argument-hint: [optional: message hint]
disable-model-invocation: true
---

# zeit-commit

Commit only what belongs together. Local commit only. Never push.

## 1. Check the state

- Run `git status --short` and `git diff --staged --stat`.
- If nothing is staged, show the unstaged files and ask which to add. Never run `git add -A` or `git add .` without the user's approval.
- If the repo has no commits yet, say so and stop. Use `/zeit-publish-repo` or ask first.

## 2. Check the staged diff

Read `git diff --staged` in full. Stop and report if any of these are found:
- Secrets: `.env*`, keys, tokens, or the patterns from `/zeit-security` step 2. Report file and line only.
- Debug leftovers added in this diff: `console.log`, `print(`, `debugger`, `breakpoint()`, commented-out blocks over 5 lines.
- Large or generated files: over 1 MB, `node_modules/`, build output, lockfiles changed without a manifest change.
- Mixed topics: a feature, a refactor, and a formatting change in one diff. Propose splitting into 2-3 commits with the file list for each. Commit one group at a time if the user agrees.

## 3. Write the message

Conventional Commits format:

```
type(scope): short summary in imperative mood, max 72 chars

Why this change was needed, in 1-3 short lines. Wrap at 72 chars.
```

- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`.
- Scope is optional: the folder or module name.
- Say what and why. Do not repeat the diff.
- Breaking change: add `BREAKING CHANGE:` line in the body.
- If `$ARGUMENTS` has a hint, use it for the summary.

End the message with this trailer line:

```
Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>
```

## 4. Commit

Show the message, then commit with it. Use a heredoc so quotes and newlines stay intact.

```bash
git commit -F - <<'EOF'
type(scope): summary

Body.

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>
EOF
```

- Never use `--no-verify` or skip hooks. If a hook fails, show its output and fix the cause.
- Never amend or rewrite an existing commit unless the user asks.

## 5. Report

```
Committed a1b2c3d: fix(auth): accept tokens expiring at current time
Files: 2 changed (src/auth.ts, src/auth.spec.ts)
Not pushed. Undo: git reset --soft HEAD~1
Next: run /zeit-test before pushing.
```
