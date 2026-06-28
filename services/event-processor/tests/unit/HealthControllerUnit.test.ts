import type { Response } from "express";
import HealthController from "../../src/controllers/HealthController";
import HealthService from "../../src/services/HealthService";

const response = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe("HealthController", () => {
  afterEach(() => jest.restoreAllMocks());

  it("reports liveness", () => {
    const res = response();

    HealthController.liveness({} as never, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "event-processor",
        status: "ok",
      }),
    );
  });

  it("reports not ready status", () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: false,
      checks: {
        mongo: true,
        redis: true,
        kafkaProducer: true,
        kafkaConsumer: false,
      },
    });
    const warn = jest.spyOn(console, "warn").mockImplementation();
    const res = response();

    HealthController.readiness.call(HealthController, {} as never, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      service: "event-processor",
      status: "not_ready",
      checks: {
        mongo: true,
        redis: true,
        kafkaProducer: true,
        kafkaConsumer: false,
      },
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Readiness"));
  });

  it("reports ready status", () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: true,
      checks: {
        mongo: true,
        redis: true,
        kafkaProducer: true,
        kafkaConsumer: true,
      },
    });
    const res = response();

    HealthController.readiness.call(HealthController, {} as never, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ready" }),
    );
  });
});
