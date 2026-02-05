const fs = require("fs");
const fetch = require("node-fetch");

const urls = [
  { name: "furrybellyhub", url: "https://vrcgs.tesca.io/ja?query=FURRY+BELLY+HUB" },
  { name: "furryburps", url: "https://vrcgs.tesca.io/ja?query=FURRY+BURPS" }
];

async function run() {
  let xml = "<vrchat>\n";

  for (const grp of urls) {
    const res = await fetch(grp.url);
    const text = await res.text();

    const match = text.match(/Member Count: (\d+)/i);
    const count = match ? match[1] : 0;

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
