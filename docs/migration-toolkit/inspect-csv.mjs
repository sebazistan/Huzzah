import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
for (const f of ['design', 'vfx']) {
  const rows = parse(readFileSync(`csv/${f}.csv`, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true });
  console.log('=====', f, rows.length, 'rows');
  console.log('columns:', Object.keys(rows[0]).join(' | '));
  console.log('archived:', rows.filter(r => r.Archived === 'true').length, 'draft:', rows.filter(r => r.Draft === 'true').length);
  const count = (k) => { const m = {}; rows.forEach(r => m[r[k]] = (m[r[k]] || 0) + 1); return JSON.stringify(m); };
  for (const k of Object.keys(rows[0])) if (/categor|type|section|collection$/i.test(k) && !/ID/.test(k)) console.log(k, count(k));
  const r = rows[0];
  console.log('SAMPLE:', JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v).slice(0, 140)])), null, 1));
}
