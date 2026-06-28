import type { Request, Response } from "express";
import HealthService from "../services/HealthService";

class HealthController {
  private static readonly healthService = HealthService;

  public static liveness(_req: Request, res: Response): Response {
    return res.status(200).json({
      service: "account-service",
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }
  public static readiness(_req: Request, res: Response): Response {
    const state = this.healthService.getReadiness();
    return res.status(state.ready ? 200 : 503).json({
      service: "account-service",
      status: state.ready ? "ready" : "not_ready",
      checks: state.checks,
    });
  }
}
export default HealthController;
