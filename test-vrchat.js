import fetch from "node-fetch";

const GROUPS = [
  {
    name: "FurryBellyHub",
    id: "grp_a787b893-400a-4ab0-9c15-83e21dd69e7d"
  },
  {
    name: "FurryBurps",
    id: "grp_b4f77812-b06d-42fc-b333-0e62e310e520"
  }
];

async function getGroup(group) {
  const response = await fetch(
    `https://api.vrchat.cloud/api/1/groups/${group.id}`,
    {
      headers: {
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

  return {
    name: group.name,
    members: data.memberCount
  };
}

async function run() {
  for (const group of GROUPS) {
    const result = await getGroup(group);

    console.log(
      `${result.name}: ${result.members} members`
    );
  }
}

run().catch(error => {
  console.error("VRChat test failed:");
  console.error(error);
  process.exit(1);
});
