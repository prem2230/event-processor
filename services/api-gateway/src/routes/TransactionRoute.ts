import express from "express";
import TransactionController from "../controllers/TransactionController";
import AuthenticationMiddleware from "../middleware/AuthenticationMiddleware";

const router = express.Router();

router.use(AuthenticationMiddleware.validate);
router.post("/transactions", TransactionController.createTransaction);

export default router;
