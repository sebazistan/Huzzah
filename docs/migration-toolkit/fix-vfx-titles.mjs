import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const repo = process.argv[2];
const csvFile = process.argv[3];
const rows = parse(readFileSync(csvFile, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true });
const nameBySlug = new Map(rows.map((r) => [r.Slug, r.Name.trim()]));

const dir = join(repo, 'src/content/projects');
let fixed = 0;
const stillMissing = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const file = join(dir, f);
  const d = JSON.parse(readFileSync(file, 'utf8'));
  if (d.title && String(d.title).trim()) continue;
  const name = nameBySlug.get(f.slice(0, -5));
  if (!name) { stillMissing.push(f); continue; }
  // put title right after "type" so the file reads naturally
  const out = {};
  for (const [k, v] of Object.entries(d)) { out[k] = v; if (k === 'type') out.title = name; }
  if (!out.title) out.title = name;
  writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  fixed++;
}
console.log('titles filled in:', fixed, '| still missing:', stillMissing.length ? stillMissing.join(', ') : 'none');
