import fs from "fs";
import { Client, GatewayIntentBits } from "discord.js";

// Bot token stored as a secret in GitHub
const token = process.env.DISCORD_BOT_TOKEN;

// Your Discord server IDs
const servers = [
  { name: "furrybellyhub", id: "1087777743728558183" },
  { name: "furryburps", id: "1263262629204328600" }
];

// Create Discord client with Guilds and GuildMembers intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  let xml = `<discord>\n`;

  for (const srv of servers) {
    const guild = await client.guilds.fetch(srv.id);
    await guild.members.fetch(); // fetch all members
    const count = guild.memberCount; // total members
    xml += `  <${srv.name}>${count}</${srv.name}>\n`;
    console.log(`${srv.name}: ${count} total members`);
  }

  xml += `</discord>\n`;
  fs.writeFileSync("discord.xml", xml);
  console.log("Discord XML updated!");

  client.destroy(); // safely disconnect
});

client.login(token);
