import express from "express";
import auth from "../middleware/auth.js";

import {
  createWorld,
  getUserWorlds,
  getWorld,
  updateWorld,
  requestWorldAccess,
  approveWorldAccess,
  rejectWorldAccess
} from "../controllers/worldController.js";

const router = express.Router();

/* CREATE */
router.post("/", auth, createWorld);

/* READ */
router.get("/user/:userId", getUserWorlds);
router.get("/:worldId", auth, getWorld);

/* UPDATE */
router.put("/:worldId", auth, updateWorld);

/* 🔐 ACCESS CONTROL */
router.post("/:worldId/request-access", auth, requestWorldAccess);
router.post("/:worldId/approve/:userId", auth, approveWorldAccess);
router.post("/:worldId/reject/:userId", auth, rejectWorldAccess);

export default router;
