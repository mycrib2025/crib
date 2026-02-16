import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ mood: "calm" });
});

export default router;
