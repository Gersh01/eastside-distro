#!/usr/bin/env node
// PostToolUse for Edit/Write: formats the edited file with the project's Prettier config
// (respects .prettierignore; unknown file types are skipped). If Prettier can't parse the file,
// exit code 2 shows its error to Claude so the syntax problem gets fixed right away.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Git Bash style "/c/Users/..." -> "c:/Users/..." so Windows path math works.
const native = (p) =>
  p && process.platform === 'win32' && /^\/[a-zA-Z]\//.test(p) ? `${p[1]}:${p.slice(2)}` : p;

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = native(input.tool_input?.file_path);
if (!filePath) process.exit(0);

const root = native(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
const prettier = path.join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
const target = path.resolve(root, filePath);
if (!existsSync(prettier) || !existsSync(target)) process.exit(0); // deps not installed yet

const result = spawnSync(
  process.execPath,
  [prettier, '--write', '--ignore-unknown', '--log-level', 'warn', target],
  { cwd: root, encoding: 'utf8' },
);
if (result.status !== 0) {
  process.stderr.write(`Prettier could not format ${filePath}:\n${result.stderr || result.stdout}`);
  process.exit(2);
}
process.exit(0);
