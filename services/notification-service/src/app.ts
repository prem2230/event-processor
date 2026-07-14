import cors from "cors";
import express, { type Express } from "express";
import HealthRoutes from "./routes/HealthRoute";
import NotificationRoutes from "./routes/NotificationRoute";

class NotificationServiceApp {
  private readonly app: Express;

  public constructor() {
    this.app = express();
    this.registerMiddlewares();
    this.registerRoutes();
  }

  public getApp(): Express {
    return this.app;
  }

  private registerMiddlewares(): void {
    this.app.disable("x-powered-by");
    this.app.use(cors());
    this.app.use(express.json());
  }

  private registerRoutes(): void {
    this.app.use(HealthRoutes);
    this.app.use("/v1/api", HealthRoutes);
    this.app.use("/v1/api", NotificationRoutes);
  }
}

const app = new NotificationServiceApp().getApp();

export default app;
export { NotificationServiceApp };
