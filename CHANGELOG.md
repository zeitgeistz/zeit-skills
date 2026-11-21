# Changelog

## Unreleased

### Changed
- Renamed the repo and marketplace to `zeit-agent-skills`. Old `zeit-claude-skills` links redirect.
- Descriptions now say the skills work with any coding agent and are designed mainly for Claude Code.

## v0.1.0 - 2026-11-21

### Added
- 15 skills under the `/zeit:` namespace:
  - Check: `test`, `review`, `code-check`, `perf`
  - Security: `security`, `threats`
  - Improve: `improve`, `design-check`, `deps`
  - Understand and document: `architecture` (with optional Mermaid diagram), `docs`
  - Debug and ship: `debug`, `commit`, `release`
  - Other: `focus`
- Plugin install through a Claude Code marketplace (`zeit-agent-skills`).
- Repo check in CI (`scripts/check.mjs`): validates manifests, skill frontmatter and command references.

### Security
- Every skill that changes files asks first, and never pushes, publishes or deploys.
