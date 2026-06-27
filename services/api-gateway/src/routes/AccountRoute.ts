import express from "express";
import AccountController from "../controllers/AccountController";
import AuthenticationMiddleware from "../middleware/AuthenticationMiddleware";

const router = express.Router();

router.use(AuthenticationMiddleware.validate);
router.post("/accounts", AccountController.create);
router.get("/accounts", AccountController.list);
router.get("/accounts/:accountId", AccountController.get);
export default router;
