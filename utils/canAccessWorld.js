export const canAccessWorld = (world, userId) => {
  // 🌍 Public world
  if (!world.isPrivate) return true;

  // 🚫 Not logged in
  if (!userId) return false;

  // 👑 Owner always allowed
  if (world.owner.toString() === userId) return true;

  // 👀 Approved viewer
  if (
    world.allowedViewers &&
    world.allowedViewers.some(id => id.toString() === userId)
  ) {
    return true;
  }

  // ❌ Private & not approved
  return false;
};
