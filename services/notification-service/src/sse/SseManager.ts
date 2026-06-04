import { Response } from "express";
import { NotificationCreatedEvent } from "../interfaces";

const clients = new Map<string, Set<Response>>();

export function addClient(userId: string, res: Response): void {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }

    clients.get(userId)?.add(res);

    res.on("close", () => {
        clients.get(userId)?.delete(res);
    });
}

export function sendNotification(event: NotificationCreatedEvent): void {
    const userClients = clients.get(event.data.userId);

    if (!userClients) {
        return;
    }

    for (const client of userClients) {
        client.write("event: notification\n");
        client.write(`data: ${JSON.stringify(event)}\n\n`);
    }
}