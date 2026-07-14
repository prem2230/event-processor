import type { Response } from "express";
import type { NotificationCreatedEvent } from "../../src/interfaces";
import SseManager from "../../src/services/SseManagerService";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

function mockSseResponse() {
  let closeHandler: (() => void) | undefined;

  const res: {
    close: () => void;
    on: jest.Mock;
    write: jest.Mock;
  } = {
    write: jest.fn(),
    on: jest.fn().mockImplementation((event: unknown, handler: unknown): typeof res => {
      if (event === "close" && typeof handler === "function") {
        closeHandler = handler as () => void;
      }
      return res;
    }),
    close: () => closeHandler?.(),
  };

  return res as unknown as Response & { close: () => void };
}

function notificationEvent(userId: string): NotificationCreatedEvent {
  return {
    eventId: `event-${userId}`,
    eventType: "notification.created",
    occurredAt: "2026-06-04T10:00:00.000Z",
    data: {
      userId,
      transactionId: "txn-1",
      accountId: "acc-5001",
      status: "COMPLETED",
      message: "Transaction completed successfully",
      updatedBalance: 2500,
    },
  };
}

describe("SseManager", () => {
  beforeEach(() => {
    SseManager.reset();
  });

  it("writes notification events to connected clients", () => {
    const res = mockSseResponse();
    const event = notificationEvent("user-sse-1");

    SseManager.addClient("user-sse-1", res);
    expect(SseManager.sendNotification(event)).toBe(1);

    expect(res.write).toHaveBeenCalledWith("event: notification\n");
    expect(res.write).toHaveBeenCalledWith(
      `data: ${JSON.stringify(event)}\n\n`,
    );
  });

  it("tracks connected clients", () => {
    SseManager.addClient("user-sse-count", mockSseResponse());
    SseManager.addClient("user-sse-count", mockSseResponse());

    expect(SseManager.getConnectedClientCount()).toBe(2);
  });

  it("removes clients when the SSE connection closes", () => {
    const res = mockSseResponse();
    const event = notificationEvent("user-sse-2");

    SseManager.addClient("user-sse-2", res);
    res.close();
    SseManager.sendNotification(event);

    expect(res.write).not.toHaveBeenCalled();
    expect(SseManager.getConnectedClientCount()).toBe(0);
  });

  it("does nothing when no clients are connected for a user", () => {
    expect(SseManager.sendNotification(notificationEvent("unknown-user"))).toBe(
      0,
    );
  });
});
