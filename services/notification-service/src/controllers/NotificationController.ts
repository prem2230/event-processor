import type { Request, Response } from "express";
import HealthService from "../services/HealthService";
import SseManager from "../sse/SseManager";
import Logger from "../utils/logger";

class NotificationController {
  private static readonly healthService = HealthService;
  private static readonly logger = Logger;
  private static readonly sseManager = SseManager;

  public static liveness(_req: Request, res: Response): Response {
    return res.status(200).json({
      service: "notification-service",
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }

  public static readiness(_req: Request, res: Response): Response {
    const readiness = NotificationController.healthService.getReadiness();
    const statusCode = readiness.ready ? 200 : 503;

    if (!readiness.ready) {
      NotificationController.logger.warn("Readiness check failed", {
        checks: readiness.checks,
      });
    }

    return res.status(statusCode).json({
      service: "notification-service",
      status: readiness.ready ? "ready" : "not_ready",
      checks: readiness.checks,
      connectedClients:
        NotificationController.healthService.getConnectedClientCount(),
    });
  }

  public static subscribeToNotifications(req: Request, res: Response): void {
    const rawUserId = req.params.userId as string | string[] | undefined;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : (rawUserId ?? "");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write("event: connected\n");
    res.write(`data: ${JSON.stringify({ userId, message: "connected" })}\n\n`);

    NotificationController.sseManager.addClient(userId, res);
  }
}

export default NotificationController;
