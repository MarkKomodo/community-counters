import fs from "fs";

const groups = [
  { name: "furrybellyhub", id: "grp_a787b893-400a-4ab0-9c15-83e21dd69e7d" },
  { name: "furryburps", id: "grp_b4f77812-b06d-42fc-b333-0e62e310e520" }
];

async function getMemberCount(id) {
  const url = `https://vrchat.com/api/1/groups/${id}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch VRChat group: " + id);
  }

  const data = await response.json();

  if (typeof data.memberCount !== "number") {
    throw new Error("Member count not found for " + id);
  }

  return data.memberCount;
}

async function run() {
  let xml = `<vrchat>\n`;

  for (const grp of groups) {
    const count = await getMemberCount(grp.id);
    xml += `  <${grp.name}>${count}</${grp.name}>\n`;
    console.log(`${grp.name}: ${count} members`);
  }

  xml += `</vrchat>\n`;

  fs.writeFileSync("vrchat.xml", xml);
  console.log("VRChat XML updated!");
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
