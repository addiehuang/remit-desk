#!/usr/bin/env node
//
// check-english.mjs
//
// Enforces the `## Language` rule in AGENTS.md: everything committed to this
// repository is in English, and English content uses no em dashes.
//
// Usage:
//   node scripts/check-english.mjs            check files
//   node scripts/check-english.mjs --commits  also check commit subjects,
//                                             bodies and the branch name
//
// Exit code 0 means clean. Exit code 1 means at least one violation, listed
// with file name and line number.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  'storybook-static',
  'test-results',
  'playwright-report',
  '.turbo',
  '.vercel',
]);

const SKIP_FILES = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
]);

const CHECK_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.md', '.mdx', '.json', '.css', '.scss',
  '.yml', '.yaml', '.html', '.sh', '.txt',
]);

// Rule 1: CJK characters and fullwidth punctuation.
// Code points are given numerically rather than as escapes or literals, so
// that this file passes its own check.
//
//   3000..303F  CJK symbols and punctuation
//   3040..309F  hiragana
//   30A0..30FF  katakana
//   3400..4DBF  CJK unified ideographs extension A
//   4E00..9FFF  CJK unified ideographs
//   F900..FAFF  CJK compatibility ideographs
//   FF00..FFEF  halfwidth and fullwidth forms
const NON_ENGLISH_RANGES = [
  [0x3000, 0x303f],
  [0x3040, 0x309f],
  [0x30a0, 0x30ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xf900, 0xfaff],
  [0xff00, 0xffef],
];

// Rule 2: em dash (2014) and horizontal bar (2015). The en dash (2013) is
// allowed in number and date ranges. The pound sign, curly quotes and
// apostrophes are not affected by either rule.
const EM_DASH_POINTS = new Set([0x2014, 0x2015]);

function findNonEnglish(line) {
  for (const char of line) {
    const point = char.codePointAt(0);
    for (const [start, end] of NON_ENGLISH_RANGES) {
      if (point >= start && point <= end) return char;
    }
  }
  return null;
}

function findEmDash(line) {
  for (const char of line) {
    if (EM_DASH_POINTS.has(char.codePointAt(0))) return char;
  }
  return null;
}

const violations = [];

function record(where, line, rule, sample) {
  violations.push({ where, line, rule, sample });
}

// Blocks that a tool writes and rewrites, delimited by HTML comment markers.
// Their content is not ours to edit: next dev re-adds its block on every
// start, so a fix there would be reverted and this check would flap. Listed
// explicitly rather than matched by pattern, so that no hand-written section
// can be hidden from the check by accident.
const GENERATED_BLOCKS = ['nextjs-agent-rules'];

function checkText(where, text) {
  const lines = text.split('\n');
  let insideGenerated = null;
  lines.forEach((line, i) => {
    const n = i + 1;

    if (insideGenerated === null) {
      const opening = GENERATED_BLOCKS.find((name) => line.includes(`BEGIN:${name}`));
      if (opening) {
        insideGenerated = opening;
        return;
      }
    } else {
      if (line.includes(`END:${insideGenerated}`)) insideGenerated = null;
      return;
    }

    const nonEnglish = findNonEnglish(line);
    if (nonEnglish) {
      record(where, n, 'non-English character', nonEnglish);
    }
    const emDash = findEmDash(line);
    if (emDash) {
      record(where, n, 'em dash', emDash);
    }
  });
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
      continue;
    }
    if (SKIP_FILES.has(entry)) continue;
    if (!CHECK_EXTENSIONS.has(extname(entry))) continue;
    checkText(relative(root, full), readFileSync(full, 'utf8'));
  }
}

walk(root);

if (process.argv.includes('--commits')) {
  const git = (cmd) => {
    try {
      return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return '';
    }
  };

  const branch = git('git rev-parse --abbrev-ref HEAD');
  if (branch) checkText(`branch name (${branch})`, branch);

  // Commits on this branch that are not on main yet. Falls back to the last
  // twenty commits when there is no main to compare against.
  //
  // Fields are separated by unit separator (1F) and records by record
  // separator (1E), because a commit body can contain newlines. Both are
  // built with fromCharCode so that this file contains no control characters
  // of its own.
  const UNIT = String.fromCharCode(0x1f);
  const RECORD = String.fromCharCode(0x1e);

  const hasMain = git('git rev-parse --verify main');
  const range = hasMain ? 'main..HEAD' : '';
  const format = '--format=%H%x1f%s%x1f%b%x1e';
  const log = range
    ? git(`git log ${range} ${format}`)
    : git(`git log -20 ${format}`);

  for (const rawEntry of log.split(RECORD)) {
    const entry = rawEntry.trim();
    if (!entry) continue;
    const [hash, subject, body] = entry.split(UNIT);
    const short = hash.slice(0, 7);
    if (subject) checkText(`commit ${short} subject`, subject);
    if (body) checkText(`commit ${short} body`, body);
  }
}

if (violations.length === 0) {
  console.log('lang:check passed. No non-English characters or em dashes found.');
  process.exit(0);
}

console.error(`lang:check failed. ${violations.length} violation(s):`);
console.error('');
for (const v of violations) {
  console.error(`  ${v.where}:${v.line}  ${v.rule}  ${JSON.stringify(v.sample)}`);
}
console.error('');
console.error('Everything committed must be in English (UK spelling).');
console.error('Use a comma, colon, bracket or full stop instead of an em dash.');
console.error('En dashes in number and date ranges are fine.');
process.exit(1);
