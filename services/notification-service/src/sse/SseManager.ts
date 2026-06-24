import type { Response } from "express";
import type { NotificationCreatedEvent } from "../interfaces";
import Logger from "../utils/logger";

class SseManager {
  private static readonly logger = Logger;
  private static readonly clients = new Map<string, Set<Response>>();

  public static addClient(userId: string, res: Response): void {
    if (!SseManager.clients.has(userId)) {
      SseManager.clients.set(userId, new Set());
    }

    SseManager.clients.get(userId)?.add(res);
    SseManager.logger.info("SSE client connected", {
      connectedClients: SseManager.getConnectedClientCount(),
    });

    res.on("close", () => {
      SseManager.clients.get(userId)?.delete(res);
      if (SseManager.clients.get(userId)?.size === 0) {
        SseManager.clients.delete(userId);
      }
      SseManager.logger.info("SSE client disconnected", {
        connectedClients: SseManager.getConnectedClientCount(),
      });
    });
  }

  public static sendNotification(event: NotificationCreatedEvent): number {
    const userClients = SseManager.clients.get(event.data.userId);

    if (!userClients) {
      SseManager.logger.info("Notification has no active SSE recipients", {
        eventId: event.eventId,
        transactionId: event.data.transactionId,
      });
      return 0;
    }

    for (const client of userClients) {
      client.write("event: notification\n");
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    SseManager.logger.info("Notification delivered to SSE clients", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      recipientConnections: userClients.size,
    });

    return userClients.size;
  }

  public static getConnectedClientCount(): number {
    return Array.from(SseManager.clients.values()).reduce(
      (total, userClients) => total + userClients.size,
      0,
    );
  }

  public static reset(): void {
    SseManager.clients.clear();
  }
}

export default SseManager;
