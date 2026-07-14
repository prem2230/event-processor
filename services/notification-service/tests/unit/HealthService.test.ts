import KafkaConsumer from "../../src/kafka/KafkaConsumer";
import HealthService from "../../src/services/HealthService";
import SseManager from "../../src/services/SseManagerService";
import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("HealthService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports ready when Kafka consumer is running", () => {
    jest.spyOn(KafkaConsumer, "isReady").mockReturnValue(true);

    expect(HealthService.getReadiness()).toEqual({
      ready: true,
      checks: {
        kafkaConsumer: true,
        sseManager: true,
      },
    });
  });

  it("reports not ready when Kafka consumer is unavailable", () => {
    jest.spyOn(KafkaConsumer, "isReady").mockReturnValue(false);

    expect(HealthService.getReadiness()).toEqual({
      ready: false,
      checks: {
        kafkaConsumer: false,
        sseManager: true,
      },
    });
  });

  it("returns connected SSE clients", () => {
    jest.spyOn(SseManager, "getConnectedClientCount").mockReturnValue(3);

    expect(HealthService.getConnectedClientCount()).toBe(3);
  });
});
