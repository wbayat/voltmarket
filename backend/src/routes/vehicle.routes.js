import express from "express";
import {
  getVehicles,
  getVehicleById,
  getHotDeals,
} from "../controllers/vehicle.controller.js";

const router = express.Router();

router.get("/", getVehicles);
router.get("/hot-deals", getHotDeals);
router.get("/:id", getVehicleById);

export default router;
