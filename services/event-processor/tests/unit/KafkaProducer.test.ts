/* eslint-disable @typescript-eslint/no-require-imports */

describe("KafkaProducer", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("connects and publishes notification events", async () => {
    const producer = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
    };
    const Kafka = jest.fn(() => ({
      producer: jest.fn(() => producer),
    }));
    jest.doMock("kafkajs", () => ({
      Kafka,
      Partitioners: { LegacyPartitioner: jest.fn() },
    }));

    await jest.isolateModulesAsync(async () => {
      const KafkaProducer = require("../../src/kafka/KafkaProducer").default;

      expect(KafkaProducer.isReady()).toBe(false);
      await KafkaProducer.connect();
      expect(KafkaProducer.isReady()).toBe(true);

      await KafkaProducer.publishNotificationCreated({
        userId: "user-1",
        transactionId: "txn-1",
        accountId: "account-1",
        status: "COMPLETED",
        message: "done",
        updatedBalance: 100,
      });
    });

    expect(Kafka).toHaveBeenCalledWith({
      clientId: "event-processor-producer",
      brokers: ["localhost:9092"],
    });
    expect(producer.connect).toHaveBeenCalled();
    expect(producer.send).toHaveBeenCalledWith({
      topic: "notification.created",
      messages: [
        {
          key: "user-1",
          value: expect.stringContaining('"transactionId":"txn-1"'),
        },
      ],
    });
  });
});
