import fs from "fs";

// List your Bluesky accounts here
const accounts = [
  { name: "furrybellyhub", handle: "furrybellyhub.bsky.social" },
  { name: "furryburps", handle: "furryburps.bsky.social" }
];

// Fetch follower count for a single handle
async function getFollowers(handle) {
  const url = `https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch profile for ${handle}`);
  const data = await res.json();

  if (data.followersCount === undefined || data.followersCount === null) {
    throw new Error("Followers count not found for " + handle);
  }

  return data.followersCount;
}

// Main runner
async function run() {
  let xml = `<bluesky>\n`;

  for (const acc of accounts) {
    const followers = await getFollowers(acc.handle);
    xml += `  <${acc.name}>${followers}</${acc.name}>\n`;
    console.log(`${acc.name}: ${followers} followers`);
  }

  xml += `</bluesky>\n`;

  fs.writeFileSync("bluesky.xml", xml);
  console.log("Bluesky XML updated!");
}

run();
