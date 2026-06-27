import express from "express";
import UserController from "../controllers/UserController";
import AuthenticationMiddleware from "../middleware/AuthenticationMiddleware";

const router = express.Router();

router.use(AuthenticationMiddleware.validate);
router.get("/users/me", UserController.getProfile);
export default router;
