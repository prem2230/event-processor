import express, { type Express } from "express";
import AccountRoutes from "./routes/AccountRoute";
import HealthRoutes from "./routes/HealthRoute";

class AccountServiceApp {
  private readonly app: Express;
  public constructor() {
    this.app = express();
    this.app.disable("x-powered-by");
    this.app.use(express.json());
    this.app.use(HealthRoutes);
    this.app.use("/internal", AccountRoutes);
  }
  public getApp(): Express {
    return this.app;
  }
}
const app = new AccountServiceApp().getApp();
export default app;
export { AccountServiceApp };
