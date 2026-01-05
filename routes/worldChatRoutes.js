import express from "express";
import {
  sendWorldMessage,
  getWorldMessages
} from "../controllers/worldChatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:worldId", protect, getWorldMessages);
router.post("/:worldId", protect, sendWorldMessage);

export default router;
