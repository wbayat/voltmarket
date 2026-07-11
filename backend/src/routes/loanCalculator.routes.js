import express from "express";
import { getLoanCalculation } from "../controllers/loanCalculator.controller.js";

const router = express.Router();

router.post("/", getLoanCalculation);

export default router;