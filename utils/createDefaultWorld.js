export default async function createDefaultWorld(userId) {
  return await World.create({
    owner: userId,
    name: "My World",
    mood: "calm",
    stars: true,
    clouds: true,
    aurora: false,
  });
}
