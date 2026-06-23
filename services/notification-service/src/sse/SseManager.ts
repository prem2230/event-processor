import type { Response } from "express";
import type { NotificationCreatedEvent } from "../interfaces";

class SseManager {
  private static readonly clients = new Map<string, Set<Response>>();

  public static addClient(userId: string, res: Response): void {
    if (!SseManager.clients.has(userId)) {
      SseManager.clients.set(userId, new Set());
    }

    SseManager.clients.get(userId)?.add(res);

    res.on("close", () => {
      SseManager.clients.get(userId)?.delete(res);
      if (SseManager.clients.get(userId)?.size === 0) {
        SseManager.clients.delete(userId);
      }
    });
  }

  public static sendNotification(event: NotificationCreatedEvent): void {
    const userClients = SseManager.clients.get(event.data.userId);

    if (!userClients) {
      return;
    }

    for (const client of userClients) {
      client.write("event: notification\n");
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }
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
