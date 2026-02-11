import World from "./models/World.js";
import { canAccessWorld } from "./utils/canAccessWorld.js";
import rateLimit from "express-rate-limit";
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
const allowedOrigins = [
  "http://localhost:5173",
  "https://crib-frontend.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
    origin: [
      "http://localhost:5173",
      "https://crib-frontend.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
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

  socket.on("join-world", async ({ worldId }) => {
  try {
    const world = await World.findById(worldId);
    if (!world) return;

    if (!canAccessWorld(world, socket.user.id)) return;

    socket.join(worldId);
  } catch (err) {
    console.error("Socket join error:", err);
  }
  });

  socket.on("world-mood-update", ({ worldId, mood }) => {
  console.log("🌈 Mood update:", worldId, mood);
  socket.to(worldId).emit("world-mood-update", mood);
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

// 🛑 Global rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// 🔐 Auth rate limit (stricter)
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
  })
);
