import { Request, Response } from "express";
import { addClient } from "../sse/SseManager";

export const healthCheck = (_req: Request, res: Response): Response => {
    return res.status(200).json({
        service: "notification-service",
        status: "ok",
    });
};

export const subscribeToNotifications = (req: Request, res: Response): void => {
    const rawUserId = req.params.userId as string | string[] | undefined;
    const userId: string = Array.isArray(rawUserId) ? rawUserId[0] : (rawUserId ?? "");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write("event: connected\n");
    res.write(`data: ${JSON.stringify({ userId, message: "connected" })}\n\n`);

    addClient(userId, res);
};