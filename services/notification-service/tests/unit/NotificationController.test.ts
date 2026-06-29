import type { Request, Response } from "express";
import NotificationController from "../../src/controllers/HealthController";
import HealthService from "../../src/services/HealthService";
import SseManager from "../../src/services/SseManagerService";

jest.mock("../../src/services/SseManagerService", () => ({
  __esModule: true,
  default: {
    addClient: jest.fn(),
    getConnectedClientCount: jest.fn().mockReturnValue(0),
  },
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns liveness status", () => {
    const res = mockResponse();

    NotificationController.liveness({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "notification-service",
        status: "ok",
      }),
    );
  });

  it("returns readiness status when Kafka is ready", () => {
    const res = mockResponse();
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: true,
      checks: {
        kafkaConsumer: true,
        sseManager: true,
      },
    });
    jest.spyOn(HealthService, "getConnectedClientCount").mockReturnValue(2);

    NotificationController.readiness.call(
      NotificationController,
      {} as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      service: "notification-service",
      status: "ready",
      checks: {
        kafkaConsumer: true,
        sseManager: true,
      },
      connectedClients: 2,
    });
  });

  it("returns not ready when Kafka is not running", () => {
    const res = mockResponse();
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: false,
      checks: {
        kafkaConsumer: false,
        sseManager: true,
      },
    });

    NotificationController.readiness.call(
      NotificationController,
      {} as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "notification-service",
        status: "not_ready",
      }),
    );
  });

  it("subscribes a user to SSE notifications", () => {
    const req = {
      params: {
        userId: "user-101",
      },
    } as unknown as Request;
    const res = mockResponse();

    NotificationController.subscribeToNotifications.call(
      NotificationController,
      req,
      res,
    );

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/event-stream",
    );
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
    expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
    expect(res.write).toHaveBeenCalledWith("event: connected\n");
    expect(SseManager.addClient).toHaveBeenCalledWith("user-101", res);
  });

  it("subscribes using the first user id when route params are arrays", () => {
    const req = {
      params: {
        userId: ["user-101", "user-202"],
      },
    } as unknown as Request;
    const res = mockResponse();

    NotificationController.subscribeToNotifications.call(
      NotificationController,
      req,
      res,
    );

    expect(res.write).toHaveBeenCalledWith(
      `data: ${JSON.stringify({ userId: "user-101", message: "connected" })}\n\n`,
    );
    expect(SseManager.addClient).toHaveBeenCalledWith("user-101", res);
  });
});
