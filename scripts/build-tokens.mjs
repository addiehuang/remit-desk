#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { build, readSource, TARGET } from './tokens-lib.mjs';

const css = build(readSource());
writeFileSync(TARGET, css);
const count = (css.match(/--[a-z0-9-]+\s*:/g) || []).length;
console.log(`Wrote ${TARGET}, ${count} custom properties.`);
