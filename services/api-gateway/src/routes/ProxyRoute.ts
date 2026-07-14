import express from "express";
import proxyRoutes from "../config/proxyRoutes";
import ProxyController from "../controllers/ProxyController";
import AuthenticationMiddleware from "../middleware/AuthenticationMiddleware";

const router = express.Router();

router.use(AuthenticationMiddleware.validate);

for (const route of proxyRoutes) {
  router[route.method](route.publicPath, ProxyController.handler(route));
}

export default router;
