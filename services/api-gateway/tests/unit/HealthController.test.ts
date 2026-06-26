import { afterEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import HealthService from "../../src/services/HealthService";

describe("Health routes", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports liveness while Kafka is still connecting", async () => {
    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        service: "api-gateway",
        status: "ok",
      }),
    );
  });

  it("preserves the existing versioned health endpoint", async () => {
    const response = await request(app).get("/v1/api/health");

    expect(response.status).toBe(200);
    expect(response.body.service).toBe("api-gateway");
  });

  it("reports not ready while the Kafka producer is unavailable", async () => {
    jest.spyOn(HealthService, "getReadiness").mockResolvedValue({
      ready: false,
      checks: {
        kafkaProducer: false,
        userService: true,
        accountService: true,
      },
    });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("not_ready");
    expect(response.body.checks.kafkaProducer).toBe(false);
  });

  it("reports ready after the Kafka producer connects", async () => {
    jest.spyOn(HealthService, "getReadiness").mockResolvedValue({
      ready: true,
      checks: {
        kafkaProducer: true,
        userService: true,
        accountService: true,
      },
    });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ready");
  });
});
