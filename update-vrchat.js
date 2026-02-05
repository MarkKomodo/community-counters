// counter.js
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const groups = [
  { name: 'furrybellyhub', url: 'https://vrcgs.tesca.io/ja?query=FURRY+BELLY+HUB' },
  { name: 'furryburps', url: 'https://vrcgs.tesca.io/ja?query=FURRY+BURPS' }
];

async function fetchMembers(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch page');
    const html = await res.text();
    const $ = cheerio.load(html);
    const p = $('p.text-white.font-bold.m-0.line-0.text-3xl').first().text();
    return parseInt(p.replace('人', '').replace(',', '')) || 0;
  } catch (err) {
    console.log(`Error fetching ${url}: ${err.message}`);
    return 0; // Skip on error
  }
}

async function main() {
  let xml = '<vrchat>\n';

  for (const group of groups) {
    const members = await fetchMembers(group.url);
    xml += `  <${group.name}>${members}</${group.name}>\n`;
  }

  xml += '</vrchat>';

  fs.writeFileSync('groups.xml', xml, 'utf8');
  console.log('XML file updated successfully!');
}

main();
