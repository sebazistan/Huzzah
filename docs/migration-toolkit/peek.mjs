import * as cheerio from 'cheerio';
import { readFileSync } from 'node:fs';
const dir = process.argv[2];
for (const f of process.argv.slice(3)) {
  const $ = cheerio.load(readFileSync(`${dir}/${f}.html`, 'utf8'));
  $('script,style,nav,.navigation').remove();
  console.log('=====', f, '|', $('title').text());
  const main = $('section.section').first().length ? $('section.section').not('.footer').first() : $('body');
  console.log(main.text().replace(/[​-‍]/g, '').replace(/\s+/g, ' ').trim().slice(0, 1800));
  console.log('-- links:', main.find('a').map((_, a) => `${$(a).text().trim().slice(0, 30)} -> ${$(a).attr('href')}`).get().filter((l) => !l.endsWith('#')).slice(0, 40).join(' | '));
  console.log('-- imgs:', main.find('img').map((_, i) => $(i).attr('src')).get().filter(Boolean).slice(0, 30).join('\n   '));
  console.log('-- forms:', $('form').map((_, f) => `action=${$(f).attr('action')} fields=${$(f).find('input,textarea,select').map((_, i) => $(i).attr('name')).get().join(',')}`).get().join(' || '));
}
