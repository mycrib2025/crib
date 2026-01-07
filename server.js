import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import connectDB from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import worldRoutes from "./routes/worldRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import worldChatRoutes from "./routes/worldChatRoutes.js";
import worldAccessRoutes from "./routes/worldAccessRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* ---------- CORS ---------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/worlds", worldRoutes);
app.use("/api/world-chat", worldChatRoutes);
app.use("/api/world-access", worldAccessRoutes);

/* ---------- SOCKET.IO ---------- */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.user.id);

  socket.on("join-world", ({ worldId }) => {
    socket.join(worldId);
  });

  socket.on("world-message", (data) => {
    io.to(data.worldId).emit("world-message", {
      ...data,
      userId: socket.user.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

app.set("io", io);

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

/* ---------- START SERVER ---------- */
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
});
