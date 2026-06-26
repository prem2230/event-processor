import type { Request, Response } from "express";
import HealthService from "../services/HealthService";

class HealthController {
  public static liveness(_req: Request, res: Response): Response {
    return res.status(200).json({
      service: "user-service",
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }

  public static readiness(_req: Request, res: Response): Response {
    const state = HealthService.getReadiness();
    return res.status(state.ready ? 200 : 503).json({
      service: "user-service",
      status: state.ready ? "ready" : "not_ready",
      checks: state.checks,
    });
  }
}

export default HealthController;
