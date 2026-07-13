import fs from "fs";
import fetch from "node-fetch";

const groups = [
  {
    name: "furrybellyhub",
    id: "grp_a787b893-400a-4ab0-9c15-83e21dd69e7d"
  },
  {
    name: "furryburps",
    id: "grp_b4f77812-b06d-42fc-b333-0e62e310e520"
  }
];

const COOKIE = process.env.VRCHAT_COOKIE;

console.log("Cookie length:", COOKIE?.length);
console.log("Starts with auth:", COOKIE?.startsWith("auth="));
console.log("Has twoFactorAuth:", COOKIE?.includes("twoFactorAuth"));

async function getMembers(group) {
  const response = await fetch(
    `https://api.vrchat.cloud/api/1/groups/${group.id}`,
    {
      headers: {
        "Cookie": COOKIE,
        "User-Agent": "community-counters"
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `${group.name}: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  return data.memberCount;
}

async function run() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <vrchat>
`;

  for (const group of groups) {
    const members = await getMembers(group);

    console.log(
      `${group.name}: ${members} members`
    );

    xml += `    <${group.name}>${members}</${group.name}>
`;
  }

  xml += `  </vrchat>
</data>`;

  fs.writeFileSync(
    "vrchat.xml",
    xml
  );

  console.log(
    "VRChat XML updated!"
  );
}

run().catch(error => {
  console.error(
    "Failed to update VRChat:"
  );
  console.error(error);
  process.exit(1);
});
