import fs from 'fs';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const groups = [
  { name: 'furrybellyhub', url: 'https://vrcgs.tesca.io/ja?query=FURRY+BELLY+HUB' },
  { name: 'furryburps', url: 'https://vrcgs.tesca.io/ja?query=FURRY+BURPS' }
];

async function fetchMembers(url, groupName) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const text = $('p.text-white.font-bold.m-0.line-0.text-3xl')
      .first()
      .text();

    const number = parseInt(text.replace('人', '').replace(/,/g, ''), 10);
    if (isNaN(number)) throw new Error('Parse failed');

    return number;
  } catch (err) {
    console.error(`Skipping ${groupName}: ${err.message}`);
    return 0;
  }
}

async function main() {
  let xml = '<vrchat>\n';

  for (const group of groups) {
    const members = await fetchMembers(group.url, group.name);
    xml += `  <${group.name}>${members}</${group.name}>\n`;
  }

  xml += '</vrchat>\n';

  fs.writeFileSync('groups.xml', xml, 'utf8');
  console.log('groups.xml updated');
}

main();
