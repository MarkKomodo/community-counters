const fs = require("fs");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

// VRChat group URLs
const urls = [
  { name: "furrybellyhub", url: "https://vrcgs.tesca.io/ja?query=FURRY+BELLY+HUB" },
  { name: "furryburps", url: "https://vrcgs.tesca.io/ja?query=FURRY+BURPS" }
];

async function run() {
  let xml = "<vrchat>\n";

  for (const grp of urls) {
    try {
      const res = await fetch(grp.url);
      const html = await res.text();

      const $ = cheerio.load(html);

      // CSS selector equivalent of your XPath
      const countText = $("body > div:nth-child(3) > div:nth-child(3) > div > a:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > p:nth-child(2)").text();

      const count = parseInt(countText.replace(/\D/g, ""), 10) || 0;

      console.log(`${grp.name}: ${count} members`);
      xml += `  <${grp.name}>${count}</${grp.name}>\n`;
    } catch (err) {
      console.error(`${grp.name} error: ${err.message}`);
      xml += `  <${grp.name}>0</${grp.name}>\n`;
    }
  }

  xml += "</vrchat>\n";
  fs.writeFileSync("vrchat.xml", xml);
  console.log("VRChat XML updated!");
}

run();
