import express, { type Express } from "express";
import HealthRoutes from "./routes/HealthRoute";
import UserRoutes from "./routes/UserRoute";

class UserServiceApp {
  private readonly app: Express;
  public constructor() {
    this.app = express();
    this.app.disable("x-powered-by");
    this.app.use(express.json());
    this.app.use(HealthRoutes);
    this.app.use("/internal", UserRoutes);
  }
  public getApp(): Express {
    return this.app;
  }
}

const app = new UserServiceApp().getApp();
export default app;
export { UserServiceApp };
