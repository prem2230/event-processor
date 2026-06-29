import type { Response } from "express";
import HealthController from "../../src/controllers/HealthController";
import HealthService from "../../src/services/HealthService";
import { afterEach, describe, expect, it, jest } from "@jest/globals";

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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports liveness", () => {
    const res = response();

    HealthController.liveness({} as never, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "user-service",
        status: "ok",
      }),
    );
  });

  it("reports ready status", () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: true,
      checks: { mongo: true },
    });
    const res = response();

    HealthController.readiness.call(HealthController, {} as never, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      service: "user-service",
      status: "ready",
      checks: { mongo: true },
    });
  });

  it("reports not ready status", () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: false,
      checks: { mongo: false },
    });
    const res = response();

    HealthController.readiness.call(HealthController, {} as never, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      service: "user-service",
      status: "not_ready",
      checks: { mongo: false },
    });
  });
});
