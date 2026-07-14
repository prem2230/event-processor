import type { Response } from "express";
import type { NotificationCreatedEvent } from "../interfaces";
import Logger from "../utils/logger";

class SseManager {
  private static readonly logger = Logger;
  private static readonly clients = new Map<string, Set<Response>>();

  public static addClient(userId: string, res: Response): void {
    if (!SseManager.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }

    this.clients.get(userId)?.add(res);
    this.logger.info("SSE client connected", {
      connectedClients: this.getConnectedClientCount(),
    });

    res.on("close", () => {
      this.clients.get(userId)?.delete(res);
      if (this.clients.get(userId)?.size === 0) {
        this.clients.delete(userId);
      }
      this.logger.info("SSE client disconnected", {
        connectedClients: this.getConnectedClientCount(),
      });
    });
  }

  public static sendNotification(event: NotificationCreatedEvent): number {
    const userClients = this.clients.get(event.data.userId);

    if (!userClients) {
      this.logger.info("Notification has no active SSE recipients", {
        eventId: event.eventId,
        transactionId: event.data.transactionId,
      });
      return 0;
    }

    for (const client of userClients) {
      client.write("event: notification\n");
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    this.logger.info("Notification delivered to SSE clients", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      recipientConnections: userClients.size,
    });

    return userClients.size;
  }

  public static getConnectedClientCount(): number {
    return Array.from(this.clients.values()).reduce(
      (total, userClients) => total + userClients.size,
      0,
    );
  }

  public static reset(): void {
    SseManager.clients.clear();
  }
}

export default SseManager;
