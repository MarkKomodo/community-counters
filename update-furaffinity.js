import fs from "fs";

// List your FurAffinity accounts here
const accounts = [
  { name: "furrybellyhub", user: "furrybellyhub" }
];

// Target: watcher count ("Watched by N")
const STAT = "watchers";

// Multiple patterns because FA's markup around the watchlist link varies.
// The count appears in text like:  View List (Watched by 1)
const PATTERNS = [
  /View List \(Watched by\s*([\d,]+)\)/i,
  /Watched by\s*([\d,]+)/i,
  /watchlist\/[^"]*"[^>]*>\s*(?:<[^>]+>\s*)*Watched by\s*([\d,]+)/i
];

function getPreviousValue(name) {
  try {
    const xml = fs.readFileSync("furaffinity.xml", "utf8");
    const re = new RegExp(`<${name}>(\\d+)</${name}>`);
    const match = xml.match(re);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}

function parseWatchers(html, user) {
  for (const re of PATTERNS) {
    const m = html.match(re);
    if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  }
  throw new Error(
    `"Watched by" not found on ${user}'s page - FA may hide it from logged-out visitors`
  );
}

// Fetch the FA userpage HTML - direct first, then via reader proxy if blocked
async function fetchPage(user) {
  const target = `https://www.furaffinity.net/user/${encodeURIComponent(user)}`;

  // Attempt 1: direct, with a full set of browser-like headers
  try {
    const res = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
      }
    });
    if (res.ok) {
      console.log("direct fetch OK");
      return await res.text();
    }
    console.log(`direct fetch HTTP ${res.status}, trying reader proxy...`);
  } catch (err) {
    console.log(`direct fetch error (${err.message}), trying reader proxy...`);
  }

  // Attempt 2: r.jina.ai reader proxy - fetches from their servers instead
  // (free tier is fine for a 30-minute cron)
  const res2 = await fetch(`https://r.jina.ai/${target}`, {
    headers: { "X-Return-Format": "html" }
  });
  if (!res2.ok) throw new Error(`reader proxy HTTP ${res2.status}`);
  console.log("reader proxy fetch OK");
  return await res2.text();
}

// Fetch watcher count for one user
async function getWatchers(user) {
  const html = await fetchPage(user);
  return parseWatchers(html, user);
}

// Main runner
async function run() {
  let xml = `<furaffinity stat="${STAT}">\n`;

  for (const acc of accounts) {
    const previous = getPreviousValue(acc.name);
    try {
      const value = await getWatchers(acc.user);
      xml += `  <${acc.name}>${value}</${acc.name}>\n`;
      console.log(`${acc.name}: ${value} watchers`);
    } catch (err) {
      // Keep the previous value if anything goes wrong
      if (previous !== null) {
        xml += `  <${acc.name}>${previous}</${acc.name}>\n`;
        console.log(`${acc.name}: fetch failed (${err.message}), keeping ${previous}`);
      } else {
        console.log(`${acc.name}: fetch failed (${err.message}), no previous value`);
      }
    }
  }

  xml += `</furaffinity>\n`;

  fs.writeFileSync("furaffinity.xml", xml);
  console.log("FurAffinity XML updated!");
}

run();
