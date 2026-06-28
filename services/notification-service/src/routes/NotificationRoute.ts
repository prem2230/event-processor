import express from "express";
import NotificationController from "../controllers/HealthController";

const router = express.Router();

router.get("/events/:userId", NotificationController.subscribeToNotifications);

export default router;
