import { afterEach, describe, expect, it, jest } from "@jest/globals";
import HealthService from "../../src/services/HealthService";

describe("HealthService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports ready when upstream services are healthy", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response("{}", {
        status: 200,
      }),
    );

    const readiness = await HealthService.getReadiness();

    expect(readiness).toEqual({
      ready: true,
      checks: {
        userService: true,
        accountService: true,
      },
    });
  });

  it("reports not ready when an upstream service is unavailable", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockRejectedValueOnce(new Error("timeout"));

    const readiness = await HealthService.getReadiness();

    expect(readiness.ready).toBe(false);
    expect(readiness.checks).toEqual({
      userService: true,
      accountService: false,
    });
  });
});
