import type { Request, Response } from "express";
import HealthService from "../services/HealthService";
import Logger from "../utils/logger";

class HealthController {
  private readonly logger = Logger;
  private readonly healthService = HealthService;

  public readonly liveness = (_req: Request, res: Response): Response => {
    return res.status(200).json({
      service: "api-gateway",
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  };

  public readonly readiness = async (
    _req: Request,
    res: Response,
  ): Promise<Response> => {
    const readiness = await this.healthService.getReadiness();
    const statusCode = readiness.ready ? 200 : 503;

    if (!readiness.ready) {
      this.logger.warn("Readiness check failed", {
        checks: readiness.checks,
      });
    }

    return res.status(statusCode).json({
      service: "api-gateway",
      status: readiness.ready ? "ready" : "not_ready",
      checks: readiness.checks,
    });
  };
}

export default new HealthController();
