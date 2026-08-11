import fs from "fs";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

const USERNAME = "furrybellyhub";

// Optional: Pass a proxy string (e.g., http://user:pass@host:port) via environment variables
const PROXY_URL = process.env.PROXY_URL;

async function getFollowers() {
  const fetchOptions = {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  };

  // Inject residential proxy agent if defined in your workflow environment
  if (PROXY_URL) {
    fetchOptions.agent = new HttpsProxyAgent(PROXY_URL);
  }

  const response = await fetch(
    `https://tikwm.com{USERNAME}`,
    fetchOptions
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