import { Response } from "express";
import { addClient, sendNotification } from "../../src/sse/SseManager";
import { NotificationCreatedEvent } from "../../src/interfaces";

function mockSseResponse() {
  let closeHandler: (() => void) | undefined;

  const res: {
    write: jest.Mock;
    on: jest.Mock;
    close: () => void;
  } = {
    write: jest.fn(),
    on: jest.fn((event: string, handler: () => void): typeof res => {
      if (event === "close") {
        closeHandler = handler;
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
  it("writes notification events to connected clients", () => {
    const res = mockSseResponse();
    const event = notificationEvent("user-sse-1");

    addClient("user-sse-1", res);
    sendNotification(event);

    expect(res.write).toHaveBeenCalledWith("event: notification\n");
    expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(event)}\n\n`);
  });

  it("removes clients when the SSE connection closes", () => {
    const res = mockSseResponse();
    const event = notificationEvent("user-sse-2");

    addClient("user-sse-2", res);
    res.close();
    sendNotification(event);

    expect(res.write).not.toHaveBeenCalled();
  });

  it("does nothing when no clients are connected for a user", () => {
    expect(() => sendNotification(notificationEvent("unknown-user"))).not.toThrow();
  });
});
