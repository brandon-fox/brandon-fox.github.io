#!/usr/bin/env node
// Front-matter invariant for src/content/writing.
// Every essay must declare title, description, date (YYYY-MM-DD) and draft (true|false).
// Exit 1 on the first repository where this is not so. No dependencies on purpose.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../src/content/writing/', import.meta.url));
const required = {
  title: (v) => v.length > 0,
  description: (v) => v.length > 0,
  date: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
  draft: (v) => v === 'true' || v === 'false',
};

let errors = 0;
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const text = readFileSync(join(dir, file), 'utf8').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) {
    console.error(`FAIL ${file}: no front matter block`);
    errors++;
    continue;
  }
  const fields = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^["'](.*)["']$/, '$1');
  }
  for (const [key, ok] of Object.entries(required)) {
    if (!(key in fields)) {
      console.error(`FAIL ${file}: missing '${key}'`);
      errors++;
    } else if (!ok(fields[key])) {
      console.error(`FAIL ${file}: '${key}' is '${fields[key]}', which is not valid`);
      errors++;
    }
  }
  if (!/^[a-z0-9-]+\.md$/.test(file)) {
    console.error(`FAIL ${file}: file name must be lowercase kebab-case (it becomes the URL)`);
    errors++;
  }
}

console.log(`${files.length} essay file(s) checked, ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
