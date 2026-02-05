import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

function normalize(text) {
  if (!text) return null;

  text = text.toLowerCase().trim();

  if (text === "?" || text === "unknown") return null;

  if (text.endsWith("k")) {
    return Math.round(parseFloat(text) * 1000);
  }

  if (text.endsWith("m")) {
    return Math.round(parseFloat(text) * 1000000);
  }

  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(num) ? null : num;
}

function getPreviousFollowers() {
  try {
    const xml = fs.readFileSync("instagram.xml", "utf8");
    const match = xml.match(/<followers>(\d+)<\/followers>/);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}

async function run() {
  const response = await fetch(
    `https://img.shields.io/instagram/followers/${USERNAME}.json`
  );

  const data = await response.json();

  const newFollowers = normalize(data.message);
  const oldFollowers = getPreviousFollowers();

  const followers =
    newFollowers !== null ? newFollowers : oldFollowers ?? 0;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <instagram>
    <username>${USERNAME}</username>
    <followers>${followers}</followers>
  </instagram>
</data>`;

  fs.writeFileSync("instagram.xml", xml);
  console.log("Followers set to:", followers);
}

run();
