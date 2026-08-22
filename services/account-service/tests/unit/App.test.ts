import { afterEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import AccountService from "../../src/services/AccountService";
import HealthService from "../../src/services/HealthService";

describe("Account Service app", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports liveness", async () => {
    const response = await request(app).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.body.service).toBe("account-service");
  });

  it("reports readiness from MongoDB state", async () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: false,
      checks: { mongo: false },
    });
    expect((await request(app).get("/health/ready")).status).toBe(503);
  });

  it("rejects internal routes without a service token", async () => {
    const response = await request(app).get("/internal/accounts");
    expect(response.status).toBe(401);
  });

  it("allows internal routes with a valid service token", async () => {
    jest.spyOn(AccountService, "list").mockResolvedValue([]);

    const response = await request(app)
      .get("/internal/accounts")
      .set("x-internal-service-token", "local-internal-service-token")
      .set("x-authenticated-user-id", "user-1");

    expect(response.status).toBe(200);
  });
});
