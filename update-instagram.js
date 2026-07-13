import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

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
    `https://socialblade.com/instagram/user/${USERNAME}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    }
  );

  const html = await response.text();

  /*
    SocialBlade usually renders followers like:

    <span class="YouTubeUserTopInfo">18,742</span>
    <span class="YouTubeUserTopLight">Followers</span>
  */

  const match = html.match(
    /([\d,]+)<\/span>\s*<span[^>]*>Followers/i
  );

  const oldFollowers = getPreviousFollowers();

  if (!match) {
    console.log("SocialBlade follower count not found, keeping previous value");
    return;
  }

  const followers = parseInt(match[1].replace(/,/g, ""), 10);

  if (Number.isNaN(followers)) {
    console.log("Parsed NaN, keeping previous value");
    return;
  }

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
