import World from "../models/World.js";

/**
 * 🙋 REQUEST ACCESS TO PRIVATE WORLD
 */
export const requestWorldAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { worldId } = req.params;

    const world = await World.findById(worldId);

    if (!world) {
      return res.status(404).json({ message: "World not found" });
    }

    if (!world.isPrivate) {
      return res.status(400).json({ message: "World is public" });
    }

    if (
      world.allowedViewers.includes(userId) ||
      world.accessRequests.includes(userId)
    ) {
      return res.status(400).json({ message: "Request already exists" });
    }

    world.accessRequests.push(userId);
    await world.save();

    res.json({ message: "Access request sent" });
  } catch (err) {
    console.error("Request access error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ ACCEPT ACCESS REQUEST (OWNER ONLY)
 */
export const approveWorldAccess = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { worldId, userId } = req.params;

    const world = await World.findById(worldId);

    if (!world) {
      return res.status(404).json({ message: "World not found" });
    }

    if (world.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    world.accessRequests = world.accessRequests.filter(
      (id) => id.toString() !== userId
    );

    world.allowedViewers.push(userId);
    await world.save();

    res.json({ message: "Access approved" });
  } catch (err) {
    console.error("Approve access error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ❌ REJECT ACCESS REQUEST (OWNER ONLY)
 */
export const rejectWorldAccess = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { worldId, userId } = req.params;

    const world = await World.findById(worldId);

    if (!world) {
      return res.status(404).json({ message: "World not found" });
    }

    if (world.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    world.accessRequests = world.accessRequests.filter(
      (id) => id.toString() !== userId
    );

    await world.save();

    res.json({ message: "Access request rejected" });
  } catch (err) {
    console.error("Reject access error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
