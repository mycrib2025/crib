import Message from "../models/Message.js";

const initWorldSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // JOIN WORLD
    socket.on("joinWorld", ({ worldId }) => {
      socket.join(worldId);
      console.log(`🌍 Joined world: ${worldId}`);
    });

    // LEAVE WORLD
    socket.on("leaveWorld", ({ worldId }) => {
      socket.leave(worldId);
      console.log(`🚪 Left world: ${worldId}`);
    });

    // SEND MESSAGE
    socket.on("sendMessage", async ({ worldId, senderId, text }) => {
      try {
        const message = await Message.create({
          world: worldId,
          sender: senderId,
          text
        });

        io.to(worldId).emit("newMessage", message);
      } catch (error) {
        console.error("Socket message error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};

export default initWorldSocket;
