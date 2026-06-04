import express from "express";
import {
  createTransaction,
  healthCheck,
} from "../controllers/TransactionController";

const router = express.Router();

router.get("/health", healthCheck);
router.post("/transactions", createTransaction);

export default router;
