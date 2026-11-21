// Repo checks run in CI. No dependencies: Node 18+ only.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const errors = [];
const fail = (msg) => errors.push(msg);

// 1. Manifests are valid JSON with the required fields.
const plugin = JSON.parse(readFileSync(join(root, ".claude-plugin/plugin.json"), "utf8"));
const market = JSON.parse(readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8"));
for (const key of ["name", "version", "description"]) {
  if (!plugin[key]) fail(`plugin.json: missing "${key}"`);
}
if (!market.plugins?.some((p) => p.name === plugin.name)) {
  fail(`marketplace.json: no plugin entry named "${plugin.name}"`);
}

// 2. Every skill folder has a SKILL.md whose name matches its folder.
const skillsDir = join(root, "skills");
const skills = readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
const names = new Set();
for (const dir of skills) {
  const file = join(skillsDir, dir.name, "SKILL.md");
  if (!existsSync(file)) {
    fail(`skills/${dir.name}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) {
    fail(`skills/${dir.name}/SKILL.md: no frontmatter`);
    continue;
  }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim();
  if (name !== dir.name) fail(`skills/${dir.name}/SKILL.md: name "${name}" must equal folder name`);
  if (!desc) fail(`skills/${dir.name}/SKILL.md: missing description`);
  names.add(dir.name);
}

// 3. Every /zeit:<name> reference points at a real skill.
for (const dir of skills) {
  const text = readFileSync(join(skillsDir, dir.name, "SKILL.md"), "utf8");
  for (const [, ref] of text.matchAll(/\/zeit:([a-z-]+)/g)) {
    if (!names.has(ref)) fail(`skills/${dir.name}/SKILL.md: references /zeit:${ref}, no such skill`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `FAIL ${e}`).join("\n"));
  process.exit(1);
}
console.log(`OK: ${skills.length} skills, manifests valid, all references resolve.`);
