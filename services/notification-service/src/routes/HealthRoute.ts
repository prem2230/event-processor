import express from "express";
import NotificationController from "../controllers/HealthController";

const router = express.Router();

router.get("/health", NotificationController.liveness);
router.get("/health/live", NotificationController.liveness);
router.get("/health/ready", NotificationController.readiness);

export default router;
