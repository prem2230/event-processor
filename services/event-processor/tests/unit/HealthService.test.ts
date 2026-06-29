import MongoConnection from "../../src/config/mongo";
import KafkaConsumer from "../../src/kafka/KafkaConsumer";
import KafkaProducer from "../../src/kafka/KafkaProducer";
import HealthService from "../../src/services/HealthService";

jest.mock("../../src/config/mongo", () => ({
  __esModule: true,
  default: { isReady: jest.fn() },
}));

jest.mock("../../src/kafka/KafkaConsumer", () => ({
  __esModule: true,
  default: { isReady: jest.fn() },
}));

jest.mock("../../src/kafka/KafkaProducer", () => ({
  __esModule: true,
  default: { isReady: jest.fn() },
}));

describe("HealthService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reports ready when every dependency is ready", () => {
    jest.mocked(MongoConnection.isReady).mockReturnValue(true);
    jest.mocked(KafkaProducer.isReady).mockReturnValue(true);
    jest.mocked(KafkaConsumer.isReady).mockReturnValue(true);

    expect(HealthService.getReadiness()).toEqual({
      ready: true,
      checks: {
        mongo: true,
        kafkaProducer: true,
        kafkaConsumer: true,
      },
    });
  });

  it("reports not ready when any dependency is unavailable", () => {
    jest.mocked(MongoConnection.isReady).mockReturnValue(true);
    jest.mocked(KafkaProducer.isReady).mockReturnValue(false);
    jest.mocked(KafkaConsumer.isReady).mockReturnValue(true);

    expect(HealthService.getReadiness()).toEqual({
      ready: false,
      checks: {
        mongo: true,
        kafkaProducer: false,
        kafkaConsumer: true,
      },
    });
  });
});
