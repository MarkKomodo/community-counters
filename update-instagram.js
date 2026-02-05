import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

async function run() {
  const response = await fetch(`https://dumpor.io/v/${USERNAME}`);
  const html = await response.text();

  const match = html.match(/Followers<\/div>\s*<div[^>]*>([\d,.]+)/i);
  if (!match) {
    throw new Error("Follower count not found");
  }

  const followers = match[1].replace(/,/g, "");

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
