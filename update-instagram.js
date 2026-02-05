import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

function normalizeNumber(text) {
  return parseInt(text.replace(/[^0-9]/g, ""), 10);
}

async function run() {
  const response = await fetch(`https://www.picuki.com/profile/${USERNAME}`, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const html = await response.text();

  // Picuki exposes followers as: <span>12,345</span> Followers
  const match = html.match(/<span[^>]*>([\d,]+)<\/span>\s*Followers/i);

  if (!match) {
    throw new Error("Follower count not found (Picuki)");
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
