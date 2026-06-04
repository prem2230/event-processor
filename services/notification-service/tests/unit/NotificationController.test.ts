import { Request, Response } from "express";
import {
  healthCheck,
  subscribeToNotifications,
} from "../../src/controllers/NotificationController";
import { addClient } from "../../src/sse/SseManager";

jest.mock("../../src/sse/SseManager", () => ({
  addClient: jest.fn(),
}));

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.write = jest.fn().mockReturnValue(true);
  return res;
}

describe("NotificationController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns health status", () => {
    const res = mockResponse();

    healthCheck({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      service: "notification-service",
      status: "ok",
    });
  });

  it("subscribes a user to SSE notifications", () => {
    const req = {
      params: {
        userId: "user-101",
      },
    } as unknown as Request;
    const res = mockResponse();

    subscribeToNotifications(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/event-stream"
    );
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
    expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
    expect(res.write).toHaveBeenCalledWith("event: connected\n");
    expect(addClient).toHaveBeenCalledWith("user-101", res);
  });
});
