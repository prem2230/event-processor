import express from "express";
import HealthController from "../controllers/HealthController";

const router = express.Router();

router.get("/health", HealthController.liveness);
router.get("/health/live", HealthController.liveness);
router.get("/health/ready", HealthController.readiness);

export default router;
