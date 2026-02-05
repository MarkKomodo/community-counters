import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

function normalizeNumber(text) {
  text = text.toLowerCase().trim();

  if (text.endsWith("k")) {
    return Math.round(parseFloat(text) * 1000);
  }
  if (text.endsWith("m")) {
    return Math.round(parseFloat(text) * 1000000);
  }
  return parseInt(text.replace(/[^0-9]/g, ""), 10);
}

async function run() {
  const response = await fetch(`https://dumpor.io/v/${USERNAME}`, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const html = await response.text();

  // Match patterns like "12.3k Followers" or "12,345 Followers"
  const match = html.match(/([\d.,]+[km]?)\s*followers/i);

  if (!match) {
    throw new Error("Follower count not found in page text");
  }

  const followers = normalizeNumber(match[1]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <instagram>
    <username>${USERNAME}</username>
    <followers>${followers}</followers>
  </instagram>
</data>`;

  fs.writeFileSync("instagram.xml", xml);
  console.log("Updated followers:", followers);
}

run();
