import express from "express";
import UserController from "../controllers/UserController";
import InternalAuthMiddleware from "../middleware/InternalAuthMiddleware";

const router = express.Router();
router.use(InternalAuthMiddleware.validate);
router.post("/users", UserController.register);
router.post("/auth/verify", UserController.verifyCredentials);
router.get("/users/me", UserController.getProfile);
export default router;
