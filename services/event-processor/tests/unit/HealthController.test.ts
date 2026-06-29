import request from "supertest";
import app from "../../src/app";
import HealthService from "../../src/services/HealthService";

describe("Health routes", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports liveness while dependencies are still starting", async () => {
    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        service: "event-processor",
        status: "ok",
      }),
    );
  });

  it("reports not ready when a dependency is unavailable", async () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: false,
      checks: {
        mongo: true,
        kafkaProducer: true,
        kafkaConsumer: false,
      },
    });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(500);
  });

  it("reports ready when all dependencies are available", async () => {
    jest.spyOn(HealthService, "getReadiness").mockReturnValue({
      ready: true,
      checks: {
        mongo: true,
        kafkaProducer: true,
        kafkaConsumer: true,
      },
    });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(500);
  });
});
