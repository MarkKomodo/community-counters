import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "furrybellyhub";

// List of public API endpoints to attempt sequentially if one throws a block or 403
const API_ENDPOINTS = [
  `https://tikwm.com{USERNAME}`,
  `https://tikwm.com{USERNAME}`
];

async function fetchWithTimeout(url, options, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function getFollowers() {
  const fetchOptions = {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://google.com",
      "Origin": "https://tikwm.com",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "Cache-Control": "no-cache"
    }
  };

  let lastError = null;

  for (const url of API_ENDPOINTS) {
    try {
      console.log(`Attempting to fetch data from: ${url}`);
      const response = await fetchWithTimeout(url, fetchOptions);

      if (!response.ok) {
        console.warn(`Endpoint returned status ${response.status}. Trying next...`);
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const json = await response.json();

      if (json.code !== 0) {
        console.warn(`API returned internal error code ${json.code}: ${json.msg}`);
        lastError = new Error(`TikWM error: ${json.msg}`);
        continue;
      }

      const followers = json.data?.stats?.followerCount;
      if (followers !== undefined && followers !== null) {
        return followers;
      }

      lastError = new Error("Follower count data missing from payload.");
    } catch (err) {
      console.warn(`Failed connection to ${url}: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All fallback API endpoints failed.");
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
    console.log(`Successfully updated TikTok followers: ${followers}`);
  } catch (err) {
    console.error("Critical Failure: Failed to update TikTok followers data:");
    console.error(err.message);
    process.exit(1);
  }
}

run();