import fs from "fs";

const servers = [
  { name: "furrybellyhub", url: "https://discord.com/api/guilds/1087777743728558183/widget.json" },
  { name: "furryburps", url: "https://discord.com/api/guilds/1263262629204328600/widget.json" }
];

async function getMembers(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Discord server JSON: " + url);
  const data = await res.json();

  // Use approximate_member_count if available, fallback to members array length
  if (data.approximate_member_count !== undefined) {
    return data.approximate_member_count;
  }
  if (data.members && Array.isArray(data.members)) {
    return data.members.length;
  }

  return 0; // fallback if no info
}

async function run() {
  let xml = `<discord>\n`;

  for (const srv of servers) {
    const count = await getMembers(srv.url);
    xml += `  <${srv.name}>${count}</${srv.name}>\n`;
    console.log(`${srv.name}: ${count} members`);
  }

  xml += `</discord>\n`;

  fs.writeFileSync("discord.xml", xml);
  console.log("Discord XML updated!");
}

run();
