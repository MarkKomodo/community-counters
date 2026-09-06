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

// Fetch watcher count from a FA userpage
async function getWatchers(user) {
  const url = `https://www.furaffinity.net/user/${encodeURIComponent(user)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${user}`);
  const html = await res.text();

  for (const re of PATTERNS) {
    const m = html.match(re);
    if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  }

  throw new Error(
    `"Watched by" not found on ${user}'s page - FA may hide it from logged-out visitors`
  );
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
