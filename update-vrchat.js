// counter.js
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const groups = [
  { name: 'furrybellyhub', url: 'https://vrcgs.tesca.io/ja?query=FURRY+BELLY+HUB' },
  { name: 'furryburps', url: 'https://vrcgs.tesca.io/ja?query=FURRY+BURPS' }
];

async function fetchMembers(url, groupName) {
  try {
    const res = await fetch(url, { timeout: 10000 }); // 10s timeout
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const p = $('p.text-white.font-bold.m-0.line-0.text-3xl').first().text();
    const number = parseInt(p.replace('人', '').replace(',', ''));
    if (isNaN(number)) throw new Error('Unable to parse member count');
    return number;
  } catch (err) {
    console.error(`Error fetching ${groupName}: ${err.message}`);
    return 0; // Skip on error
  }
}

async function main() {
  let xml = '<vrchat>\n';

  for (const group of groups) {
    const members = await fetchMembers(group.url, group.name);
    xml += `  <${group.name}>${members}</${group.name}>\n`;
  }

  xml += '</vrchat>';

  try {
    fs.writeFileSync('groups.xml', xml, 'utf8');
    console.log('XML file updated successfully!');
  } catch (err) {
    console.error(`Error writing XML file: ${err.message}`);
  }
}

main();
