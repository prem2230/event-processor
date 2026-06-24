import express, { type Express } from "express";
import HealthRoutes from "./routes/HealthRoute";

class EventProcessorApp {
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
    this.app.use(express.json());
  }

  private registerRoutes(): void {
    this.app.use(HealthRoutes);
  }
}

const app = new EventProcessorApp().getApp();

export default app;
export { EventProcessorApp };
