#!/usr/bin/env node
// Fails when the Figma export and the generated stylesheet disagree, which
// happens when someone edits tokens.css by hand, or re-exports from Figma and
// forgets to run tokens:build.
import { readFileSync } from 'node:fs';
import { build, parseCss, readSource, SOURCE, TARGET } from './tokens-lib.mjs';

const expected = parseCss(build(readSource()));

let actual;
try {
  actual = parseCss(readFileSync(TARGET, 'utf8'));
} catch {
  console.error(`${TARGET} is missing. Run pnpm tokens:build.`);
  process.exit(1);
}

const problems = [];
for (const [name, value] of expected) {
  if (!actual.has(name)) problems.push(`Missing from the stylesheet: ${name} (figma=${value})`);
  else if (actual.get(name) !== value) problems.push(`Differs: ${name} figma=${value} code=${actual.get(name)}`);
}
for (const name of actual.keys()) {
  if (!expected.has(name)) problems.push(`Not in the Figma export: ${name}`);
}

if (problems.length > 0) {
  console.error('Token parity check failed.');
  for (const line of problems) console.error(`  ${line}`);
  console.error(`\nRun pnpm tokens:build, then commit ${SOURCE} and ${TARGET} together.`);
  process.exit(1);
}
console.log(`Token parity check passed, ${expected.size} tokens.`);
