import express from "express";
import auth from "../middleware/auth.js";
import {
  getUserProfile,
  followUser,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", getUserProfile);
router.post("/follow/:id", auth, followUser);
router.post("/accept/:id", auth, acceptFollowRequest);
router.post("/reject/:id", auth, rejectFollowRequest);

export default router;
