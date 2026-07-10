import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth); // every cart route requires login

router.post("/", addToCart);
router.get("/", getCart);
router.patch("/:itemId", updateCartItem);
router.delete("/:itemId", removeCartItem);

export default router;
