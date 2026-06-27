import { afterEach, describe, expect, it, jest } from "@jest/globals";
import KafkaService from "../../src/kafka/KafkaService";
import HealthService from "../../src/services/HealthService";

jest.mock("../../src/kafka/KafkaService", () => ({
  __esModule: true,
  default: {
    isReady: jest.fn(),
  },
}));

describe("HealthService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports ready when Kafka and upstream services are healthy", async () => {
    jest.mocked(KafkaService.isReady).mockReturnValue(true);
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response("{}", {
        status: 200,
      }),
    );

    const readiness = await HealthService.getReadiness();

    expect(readiness).toEqual({
      ready: true,
      checks: {
        kafkaProducer: true,
        userService: true,
        accountService: true,
      },
    });
  });

  it("reports not ready when Kafka or an upstream service is unavailable", async () => {
    jest.mocked(KafkaService.isReady).mockReturnValue(false);
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockRejectedValueOnce(new Error("timeout"));

    const readiness = await HealthService.getReadiness();

    expect(readiness.ready).toBe(false);
    expect(readiness.checks).toEqual({
      kafkaProducer: false,
      userService: true,
      accountService: false,
    });
  });
});
