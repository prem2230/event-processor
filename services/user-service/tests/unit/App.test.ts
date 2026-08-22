import request from "supertest";
import app from "../../src/app";
import HealthService from "../../src/services/HealthService";
import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("User Service app", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports liveness", async () => {
    const response = await request(app).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.body.service).toBe("user-service");
  });

  it("reports readiness from MongoDB state", async () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: false,
      checks: { mongo: false },
    });
    expect((await request(app).get("/health/ready")).status).toBe(503);
  });

  it("rejects internal routes without a service token", async () => {
    const response = await request(app).get("/internal/users/me");
    expect(response.status).toBe(401);
  });
});
