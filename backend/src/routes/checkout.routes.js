import express from "express";
import {
  checkout,
  getMyOrders,
  getOrderById,
} from "../controllers/checkout.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth); // every order/checkout route requires login

router.post("/", checkout);
router.get("/orders", getMyOrders);
router.get("/orders/:id", getOrderById);

export default router;
