import express from "express";
import AccountController from "../controllers/AccountController";
import InternalAuthMiddleware from "../middleware/InternalAuthMiddleware";

const router = express.Router();

router.use(InternalAuthMiddleware.validate);
router.post("/accounts", AccountController.create);
router.get("/accounts", AccountController.list);
router.post("/accounts/:accountId/balance-mutations", AccountController.applyBalanceMutation);
router.get("/accounts/:accountId", AccountController.get);
export default router;
