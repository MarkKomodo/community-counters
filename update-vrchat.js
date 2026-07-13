import fs from "fs";
import fetch from "node-fetch";

const COOKIE = fs.readFileSync("vrchat-cookie.txt", "utf8");

const GROUPS = [
  {
    name: "furrybellyhub",
    id: "grp_a787b893-400a-4ab0-9c15-83e21dd69e7d"
  },
  {
    name: "furryburps",
    id: "grp_b4f77812-b06d-42fc-b333-0e62e310e520"
  }
];

async function getMembers(group) {
  const response = await fetch(
    `https://api.vrchat.cloud/api/1/groups/${group.id}`,
    {
      headers: {
        "User-Agent": "community-counters",
        "Cookie": COOKIE
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `${group.name}: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (
    data.memberCount === undefined ||
    data.memberCount === null
  ) {
    throw new Error(
      `${group.name}: member count not found`
    );
  }

  return data.memberCount;
}

async function run() {
  try {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <vrchat>
`;

    for (const group of GROUPS) {
      const members = await getMembers(group);

      xml += `    <${group.name}>${members}</${group.name}>
`;

      console.log(
        `${group.name}: ${members} members`
      );
    }

    xml += `  </vrchat>
</data>`;

    fs.writeFileSync(
      "vrchat.xml",
      xml
    );

    console.log("VRChat XML updated!");
  } catch (error) {
    console.error(
      "Failed to update VRChat:"
    );
    console.error(error);
    process.exit(1);
  }
}

run();