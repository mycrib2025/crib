import World from "../models/World.js";
import WorldChatMessage from "../models/WorldChatMessage.js";
import { canAccessWorld } from "../utils/canAccessWorld.js";

/**
 * CREATE WORLD
 */
export const createWorld = async (req, res) => {
  try {
    const world = await World.create({
      owner: req.user.id,
      name: req.body.name,
      mood: req.body.mood,
      stars: req.body.stars,
      clouds: req.body.clouds,
      aurora: req.body.aurora,
      fantasyLevel: req.body.fantasyLevel,
      dreamIntensity: req.body.dreamIntensity,
      isPrivate: req.body.isPrivate ?? false
    });

    res.status(201).json(world);
  } catch (error) {
    console.error("Create world error:", error);
    res.status(500).json({ message: "Failed to create world" });
  }
};

/**
 * REQUEST ACCESS
 */
export const requestWorldAccess = async (req, res) => {
  const world = await World.findById(req.params.worldId);
  if (!world) return res.status(404).json({ message: "World not found" });

  if (!world.isPrivate) {
    return res.status(400).json({ message: "World is public" });
  }

  if (
    !world.accessRequests.includes(req.user.id) &&
    !world.allowedViewers.includes(req.user.id)
  ) {
    world.accessRequests.push(req.user.id);
    await world.save();
  }

  res.json({ message: "Access request sent" });
};

/**
 * APPROVE ACCESS
 */
export const approveWorldAccess = async (req, res) => {
  const { worldId, userId } = req.params;
  const world = await World.findById(worldId);
  if (!world) return res.status(404).json({ message: "World not found" });

  if (world.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not owner" });
  }

  if (!world.allowedViewers.includes(userId)) {
    world.allowedViewers.push(userId);
  }

  world.accessRequests.pull(userId);
  await world.save();

  res.json({ message: "Access granted" });
};

/**
 * REJECT ACCESS
 */
export const rejectWorldAccess = async (req, res) => {
  const { worldId, userId } = req.params;
  const world = await World.findById(worldId);
  if (!world) return res.status(404).json({ message: "World not found" });

  if (world.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not owner" });
  }

  world.accessRequests.pull(userId);
  await world.save();

  res.json({ message: "Access rejected" });
};

/**
 * GET USER WORLDS ✅ (THIS WAS MISSING AT RUNTIME)
 */
export const getUserWorlds = async (req, res) => {
  try {
    const worlds = await World.find({ owner: req.params.userId });
    res.json(worlds);
  } catch {
    res.status(500).json({ message: "Failed to load worlds" });
  }
};

/**
 * GET WORLD (PRIVACY AWARE)
 */
export const getWorld = async (req, res) => {
  const world = await World.findById(req.params.worldId);
  if (!world) return res.status(404).json({ message: "World not found" });

  if (!canAccessWorld(world, req.user.id)) {
    return res.status(403).json({ message: "Private world" });
  }

  res.json(world);
};

/**
 * UPDATE WORLD
 */
export const updateWorld = async (req, res) => {
  try {
    const world = await World.findById(req.params.worldId);
    if (!world) return res.status(404).json({ message: "World not found" });

    if (world.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    Object.assign(world, req.body);
    await world.save();

    res.json(world);
  } catch (error) {
    res.status(500).json({ message: "Failed to update world" });
  }
};

/**
 * WORLD CHAT — SEND MESSAGE
 */
export const sendWorldMessage = async (req, res) => {
  const { worldId } = req.params;
  const { message } = req.body;

  const world = await World.findById(worldId);
  if (!world) return res.status(404).json({ message: "World not found" });

  if (!canAccessWorld(world, req.user.id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const chat = await WorldChatMessage.create({
    world: worldId,
    sender: req.user.id,
    message
  });

  const io = req.app.get("io");
  io.to(worldId).emit("worldMessage", chat);

  res.json(chat);
};

/**
 * WORLD CHAT — GET MESSAGES
 */
export const getWorldMessages = async (req, res) => {
  const { worldId } = req.params;

  const world = await World.findById(worldId);
  if (!world) return res.status(404).json({ message: "World not found" });

  if (!canAccessWorld(world, req.user.id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const messages = await WorldChatMessage.find({ world: worldId })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 });

  res.json(messages);
};
