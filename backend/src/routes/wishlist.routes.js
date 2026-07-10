import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// since users MUST be logged in to use the wishlist feature, we use this notation
router.use(requireAuth);

router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/:vehicleId", removeFromWishlist);

export default router;
