import express from "express";
import {
    healthCheck,
    subscribeToNotifications,
} from "../controllers/NotificationController";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/events/:userId", subscribeToNotifications);

export default router;