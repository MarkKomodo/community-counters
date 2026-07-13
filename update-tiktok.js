import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

async function getFollowers() {
  const response = await fetch(
    `https://www.tikwm.com/api/user/info?unique_id=${USERNAME}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();

  if (json.code !== 0) {
    console.log(JSON.stringify(json, null, 2));
    throw new Error(`TikWM error: ${json.msg}`);
  }

  const followers = json.data?.stats?.followerCount;

  if (followers === undefined || followers === null) {
    throw new Error("Follower count not found.");
  }

  return followers;
}

async function run() {
  try {
    const followers = await getFollowers();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <tiktok>
    <username>${USERNAME}</username>
    <followers>${followers}</followers>
  </tiktok>
</data>`;

    fs.writeFileSync("tiktok.xml", xml);

    console.log(`Updated TikTok followers: ${followers}`);
  } catch (err) {
    console.error("Failed to update TikTok followers:");
    console.error(err);
    process.exit(1);
  }
}

run();
