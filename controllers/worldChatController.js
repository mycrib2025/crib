import World from "../models/World.js";
import WorldChatMessage from "../models/WorldChatMessage.js";
import { canAccessWorld } from "../utils/canAccessWorld.js";

/**
 * SEND WORLD MESSAGE
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
 * GET WORLD CHAT HISTORY
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
