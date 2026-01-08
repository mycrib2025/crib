import express from "express";

const router = express.Router();

// TEST WORLDS ROUTE
router.get("/", (req, res) => {
  res.json({ message: "Worlds API is working ✅" });
});

export default router;
