import type { Request, Response } from "express";
import HealthService from "../services/HealthService";
import Logger from "../utils/logger";

class HealthController {
  private static readonly logger = Logger;
  private static readonly healthService = HealthService;

  public static liveness(_req: Request, res: Response): Response {
    return res.status(200).json({
      service: "event-processor",
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }

  public static readiness(_req: Request, res: Response): Response {
    const readiness = HealthController.healthService.getReadiness();
    const statusCode = readiness.ready ? 200 : 503;

    if (!readiness.ready) {
      HealthController.logger.warn("Readiness check failed", {
        checks: readiness.checks,
      });
    }

    return res.status(statusCode).json({
      service: "event-processor",
      status: readiness.ready ? "ready" : "not_ready",
      checks: readiness.checks,
    });
  }
}

export default HealthController;
