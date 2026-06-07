import express from "express";
import HealthController from "../controllers/HealthController";
import TransactionController from "../controllers/TransactionController";

const router = express.Router();

router.get("/health", HealthController.healthCheck);
router.post("/transactions", TransactionController.createTransaction);

export default router;
