# zeit-claude-skills

A set of Claude Code skills for testing, reviewing, improving and securing projects. Every command starts with `/zeit-` so they are easy to find.

## Install

Copy the skill folders into your Claude Code skills directory:

```bash
git clone https://github.com/zeitgeistz/zeit-claude-skills.git
cp -r zeit-claude-skills/skills/zeit-* ~/.claude/skills/
```

On Windows (PowerShell):

```powershell
Copy-Item -Recurse zeit-claude-skills\skills\zeit-* $HOME\.claude\skills\
```

Restart Claude Code, then type `/` to see the commands.

## Commands

| Area | Command | What it does |
|---|---|---|
| Check | `/zeit-test` | Runs the project's tests, lint, type check and build; groups failures by cause |
| Check | `/zeit-review` | Finds real bugs and risky code in a file, diff or branch |
| Check | `/zeit-code-check` | Code health: dead code, duplication, oversized files, unused deps |
| Check | `/zeit-perf` | Finds slow code and ranks it by impact |
| Security | `/zeit-security` | Whole-project security audit with baseline and fix mode |
| Security | `/zeit-threats <feature>` | Threat model for one feature (e.g. `login`, `checkout`) |
| Improve | `/zeit-improve <path>` | Makes one small, verified fix in one file |
| Improve | `/zeit-design-check <path>` | UI review for usability, accessibility and generic "AI slop" design |
| Understand | `/zeit-architecture` | Maps structure and key flows; can draw a Mermaid diagram |
| Docs | `/zeit-docs` | Checks that README and docs match the code |
| Debug | `/zeit-debug <error>` | Reproduces a bug, confirms the cause, fixes only on request |
| Ship | `/zeit-commit` | Checks staged changes, writes a Conventional Commit, commits locally |
| Ship | `/zeit-deps` | Outdated and vulnerable deps, upgraded in risk groups with tests |
| Ship | `/zeit-release` | Pre-release checklist, changelog and local tag; never pushes |
| Other | `/zeit-focus` | Short, action-first replies for an ADHD-friendly style |

## Principles

- Report first. Changes happen only when you ask (`fix`, `upgrade safe`, `save`, `write`).
- Never push, publish or deploy without your approval.
- Never print secret values.
