import express from "express";
import {
  createReview,
  getReviewsForVehicle,
} from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, createReview);
router.get("/vehicle/:vehicleId", getReviewsForVehicle);

export default router;
