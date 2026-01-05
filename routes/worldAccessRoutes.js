import express from "express";
import auth from "../middleware/auth.js";
import {
  requestWorldAccess,
  approveWorldAccess,
  rejectWorldAccess
} from "../controllers/worldAccessController.js";

const router = express.Router();

router.post("/:worldId/request", auth, requestWorldAccess);
router.post("/:worldId/approve/:requesterId", auth, approveWorldAccess);
router.post("/:worldId/reject/:requesterId", auth, rejectWorldAccess);

export default router;
