import express from "express";
import { getUsageAnalytics } from "../controllers/analytics.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// every analytics route requires an authenticated admin
router.use(requireAuth);
router.use(requireAdmin);

router.get("/usage", getUsageAnalytics);

export default router;