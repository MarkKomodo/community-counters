import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";

// VRChat group URLs from vrcgs.tesca.io
const urls = [
  { name: "furrybellyhub", url: "https://vrcgs.tesca.io/ja?query=FURRY+BELLY+HUB" },
  { name: "furryburps", url: "https://vrcgs.tesca.io/ja?query=FURRY+BURPS" }
];

async function run() {
  let xml = "<vrchat>\n";

  for (const grp of urls) {
    const res = await fetch(grp.url);
    if (!res.ok) {
      console.error(`Failed to fetch ${grp.url}: ${res.status}`);
      xml += `  <${grp.name}>0</${grp.name}>\n`;
      continue;
    }

    const text = await res.text();
    const $ = cheerio.load(text);

    // CSS selector equivalent of your XPath:
    // /html/body/div[3]/div[3]/div/a[1]/div[1]/div[2]/div[2]/p[2]
    const countText = $("body > div:nth-child(3) > div:nth-child(3) > div > a:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > p:nth-child(2)").text();

    // Remove anything that's not a digit
    const count = parseInt(countText.replace(/\D/g, ""), 10) || 0;

    console.log(`${grp.name}: ${count} members`);
    xml += `  <${grp.name}>${count}</${grp.name}>\n`;
  }

  xml += "</vrchat>\n";

  fs.writeFileSync("vrchat.xml", xml);
  console.log("VRChat XML updated!");
}

run().catch(err => {
  console.error("Error:", err.message);
});
