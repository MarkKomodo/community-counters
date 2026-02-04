import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";

const TELEGRAM_ENTITIES = [
  ["tg_channel_gifs", "https://t.me/FurryBellyGifs"],
  ["tg_channel_irl", "https://t.me/FurryBellyIRL"],
  ["tg_channel_burp", "https://t.me/FurryBurps"],
  ["tg_channel_nsfw", "https://t.me/FurryBellyNSFWC"],
  ["tg_channel_main", "https://t.me/FurryBellyHub"],
  ["tg_group_gifs", "https://t.me/FurryBellyGifsChat"],
  ["tg_group_irl", "https://t.me/FurryBellyIRLChat"],
  ["tg_group_burp", "https://t.me/FurryBurpsChat"],
  ["tg_group_nsfw", "https://t.me/FurryBellyNSFWChat"],
  ["tg_group_vr", "https://t.me/FurryBellyVR"]
];

function parseNumber(text) {
  if (!text) return 0;
  return parseInt(text.replace(/[^\d]/g, ""), 10);
}

async function fetchTelegramCount(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const counterText = $(".tgme_page_extra").first().text();
  return parseNumber(counterText);
}

async function main() {
  const countersPath = "./counters.json";
  const counters = JSON.parse(fs.readFileSync(countersPath, "utf8"));

  for (const [id, url] of TELEGRAM_ENTITIES) {
    try {
      const count = await fetchTelegramCount(url);
      const item = counters.find(c => c.id === id);

      if (item) {
        item.value = count;
        console.log(`✓ ${id}: ${count}`);
      } else {
        console.warn(`⚠ ID not found: ${id}`);
      }
    } catch (err) {
      console.error(`✗ Failed ${id}`, err.message);
    }
  }

  fs.writeFileSync(countersPath, JSON.stringify(counters, null, 2));
}

main();
