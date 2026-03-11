#!/usr/bin/env node
/**
 * No hardcoded literals in product code (localhost, ports, URLs) — common-react only.
 * Same rules as common-go script for TS/TSX; no dependency on common-go.
 * Usage: node check-hardcoded.js <repo_root> <dir1> [dir2 ...]
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.argv[2] || '.');
const dirs = process.argv.slice(3);

const BAD = /localhost|127\.0\.0\.1|["']3000["']|["']5000["']|["']8080["']|["']5432["']|:3000|:5000|:8080|:5432|http:\/\/|https:\/\//;
const ALLOW_MARKER = /ALLOW:|golden-allow:/i;
const ALLOW_WITH_REASON = /(?:ALLOW|golden-allow):\s*\S/i;
const APPROVED = /getEnvOrConfig\s*\(|getEnvOrDefault\s*\(|process\.env|fmt\.Sprintf\s*\([^)]*(%[sv][^)]*https?:\/\/|https?:\/\/[^)]*%[sv])|strings\.HasPrefix\s*\([^)]+,\s*[\x27"]https?:\/\//;
// RegExp from string so single/double quotes parse correctly under "type": "module"
const APPROVED_TS = new RegExp(
  "origin\\.startsWith\\s*\\(\\s*['\"]https?:\\/\\/|hostname\\s*===\\s*['\"]localhost['\"]|hostname\\s*===\\s*['\"]127\\.0\\.0\\.1['\"]|\\.endsWith\\s*\\(\\s*['\"]\\.localhost['\"]|Auth0.*HTTPS|localhost.*Auth0"
);
const COMMENT = /^\s*(\/\/|\*|\/\*)/;

function hasValidException(line) {
  return ALLOW_MARKER.test(line) && ALLOW_WITH_REASON.test(line);
}

function walk(dir, base, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(base, full);
    if (/generated|node_modules/.test(rel)) continue;
    if (fs.statSync(full).isDirectory()) {
      walk(full, base, out);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name) || /\.test\.(ts|tsx)$|constants\.ts$|setupTests\.ts$/.test(rel)) continue;
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (ALLOW_MARKER.test(line) && COMMENT.test(line.trim()) && !ALLOW_WITH_REASON.test(line)) {
        out.push(rel + ':' + (i + 1) + ': [exception without explanation] ' + line.trim().slice(0, 60));
        continue;
      }
      if (!BAD.test(line)) continue;
      if (COMMENT.test(line.trim())) continue;
      if (APPROVED.test(line)) continue;
      if (APPROVED_TS.test(line)) continue;
      if (hasValidException(line)) continue;
      if (i > 0 && hasValidException(lines[i - 1])) continue;
      out.push(rel + ':' + (i + 1) + ': ' + line.trim().slice(0, 80));
    }
  }
}

if (dirs.length === 0) {
  console.error('Usage: node check-hardcoded.js <repo_root> <dir1> [dir2 ...]');
  process.exit(2);
}

const violations = [];
for (const d of dirs) {
  walk(path.join(root, d), root, violations);
}
violations.forEach((v) => console.log(v));
process.exit(violations.length > 0 ? 1 : 0);
