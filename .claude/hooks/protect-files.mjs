#!/usr/bin/env node
// PreToolUse guard for Edit/Write: blocks changes that must go through a tool or a person.
// Exit code 2 blocks the edit and shows stderr to Claude; exit 0 lets it through.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Git Bash style "/c/Users/..." -> "c:/Users/..." so Windows path math works.
const native = (p) =>
  p && process.platform === 'win32' && /^\/[a-zA-Z]\//.test(p) ? `${p[1]}:${p.slice(2)}` : p;

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = native(input.tool_input?.file_path);
if (!filePath) process.exit(0);

const root = native(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
const relative = path.relative(root, path.resolve(root, filePath)).split(path.sep).join('/');
if (relative.startsWith('..')) process.exit(0); // outside this project

const block = (reason) => {
  process.stderr.write(`Blocked edit to ${relative}: ${reason}\n`);
  process.exit(2);
};

const name = path.posix.basename(relative);

if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') {
  block('env files hold secrets. Update .env.example and tell the user which value to set.');
}
if (name === 'package-lock.json') {
  block('lockfiles change only through npm install / npm uninstall.');
}
if (relative.startsWith('drizzle/meta/')) {
  block(
    'drizzle-kit owns migration snapshots. Change src/server/db/schema and run `npm run db:generate`.',
  );
}
if (relative.startsWith('docs/reference/')) {
  block(
    'these are the business’s source documents. Record notes in docs/catalog-data-review.md instead.',
  );
}
if (/^drizzle\/[^/]+\.sql$/.test(relative) && isCommitted(relative)) {
  block(
    'this migration is committed and may already be applied somewhere. Generate a new migration instead (see .claude/skills/db-change).',
  );
}

process.exit(0);

function isCommitted(file) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', file], { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    return false; // untracked (a migration being written now) or not a git repository
  }
}
