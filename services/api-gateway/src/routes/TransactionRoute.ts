import express from "express";
import TransactionController from "../controllers/TransactionController";

const router = express.Router();

router.post("/transactions", TransactionController.createTransaction);

export default router;
