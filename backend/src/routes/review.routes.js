import express from "express";
import {
  createReview,
  getReviewsForVehicle,
  getAverageRating,
} from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, createReview);
router.get("/vehicle/:vehicleId", getReviewsForVehicle);
router.get("/vehicle/:vehicleId/average", getAverageRating);

export default router;
