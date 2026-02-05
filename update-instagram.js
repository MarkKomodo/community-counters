import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

function normalize(text) {
  text = text.toLowerCase().trim();

  if (text.endsWith("k")) {
    return Math.round(parseFloat(text) * 1000);
  }
  if (text.endsWithWith("m")) {
    return Math.round(parseFloat(text) * 1000000);
  }
  return parseInt(text.replace(/[^0-9]/g, ""), 10);
}

async function run() {
  const response = await fetch(
    `https://img.shields.io/instagram/followers/${USERNAME}.json`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Shields.io data");
  }

  const data = await response.json();

  if (!data.message) {
    throw new Error("Follower count missing in Shields response");
  }

  const followers = normalize(data.message);

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
