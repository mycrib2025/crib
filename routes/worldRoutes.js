import express from "express";
import protect from "../middleware/authMiddleware.js";
import World from "../models/World.js";

const router = express.Router();

/* -----------------------------
   GET MY WORLD
-------------------------------- */
router.get("/me", protect, async (req, res) => {
  const world = await World.findOne({ owner: req.user.id });

  if (!world) {
    return res.status(404).json({ message: "No world found" });
  }

  res.json(world);
});

/* -----------------------------
   GET WORLD BY USER ID
-------------------------------- */
router.get("/user/:userId", protect, async (req, res) => {
  const world = await World.findOne({ owner: req.params.userId });

  if (!world) {
    return res.status(404).json({ message: "No world found" });
  }

  res.json([world]); // returning array because your frontend expects res.data[0]
});

/* -----------------------------
   UPDATE WORLD
-------------------------------- */
router.put("/:worldId", protect, async (req, res) => {
  const world = await World.findById(req.params.worldId);

  if (!world) {
    return res.status(404).json({ message: "World not found" });
  }

  if (world.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  Object.assign(world, req.body);

  const updated = await world.save();

  res.json(updated);
});

export default router;
