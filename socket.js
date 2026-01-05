import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import World from "./models/World.js";
import WorldMessage from "./models/WorldMessage.js";
import { canAccessWorld } from "./utils/canAccessWorld.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-world", async (worldId) => {
      const world = await World.findById(worldId);

      if (!world || !canAccessWorld(world, socket.user.id)) {
        return;
      }

      socket.join(`world:${worldId}`);
    });

    socket.on("send-message", async ({ worldId, text }) => {
      const world = await World.findById(worldId);

      if (!world || !canAccessWorld(world, socket.user.id)) return;

      const message = await WorldMessage.create({
        world: worldId,
        sender: socket.user.id,
        text
      });

      io.to(`world:${worldId}`).emit("new-message", {
        _id: message._id,
        text: message.text,
        sender: socket.user.id,
        createdAt: message.createdAt
      });
    });
  });
};
