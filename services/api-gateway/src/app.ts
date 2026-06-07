import express, { type Express } from "express";
import cors from "cors";
import TransactionRoutes from "./routes/TransactionRoute";

class ApiGatewayApp {
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
    this.app.use(cors());
    this.app.use(express.json());
  }

  private registerRoutes(): void {
    this.app.use("/v1/api", TransactionRoutes);
  }
}

const app = new ApiGatewayApp().getApp();

export default app;
export { ApiGatewayApp };
