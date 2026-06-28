/* eslint-disable @typescript-eslint/no-require-imports */

describe("KafkaConsumer", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("starts the consumer and delivers notification messages", async () => {
    let eachMessage:
      | ((payload: {
          topic: string;
          partition: number;
          message: { value: Buffer; offset: string };
        }) => Promise<void>)
      | undefined;
    const consumer = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn(async (options) => {
        eachMessage = options.eachMessage;
      }),
    };
    jest.doMock("kafkajs", () => ({
      Kafka: jest.fn(() => ({
        consumer: jest.fn(() => consumer),
      })),
    }));
    const sendNotification = jest.fn(() => 2);
    jest.doMock("../../src/services/SseManagerService", () => ({
      __esModule: true,
      default: { sendNotification },
    }));

    await jest.isolateModulesAsync(async () => {
      const KafkaConsumer = require("../../src/kafka/KafkaConsumer").default;

      expect(KafkaConsumer.isReady()).toBe(false);
      await KafkaConsumer.start();
      expect(KafkaConsumer.isReady()).toBe(true);

      await eachMessage?.({
        topic: "notification.created",
        partition: 0,
        message: {
          offset: "1",
          value: Buffer.from(
            JSON.stringify({
              eventId: "event-1",
              eventType: "notification.created",
              occurredAt: "2026-06-04T10:00:00.000Z",
              data: {
                userId: "user-1",
                transactionId: "txn-1",
                accountId: "account-1",
                status: "COMPLETED",
                message: "done",
                updatedBalance: 100,
              },
            }),
          ),
        },
      });
    });

    expect(consumer.connect).toHaveBeenCalled();
    expect(consumer.subscribe).toHaveBeenCalledWith({
      topic: "notification.created",
      fromBeginning: false,
    });
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "event-1" }),
    );
  });

  it("ignores messages without a value", async () => {
    let eachMessage:
      | ((payload: {
          topic: string;
          partition: number;
          message: { value: null; offset: string };
        }) => Promise<void>)
      | undefined;
    const consumer = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn(async (options) => {
        eachMessage = options.eachMessage;
      }),
    };
    jest.doMock("kafkajs", () => ({
      Kafka: jest.fn(() => ({
        consumer: jest.fn(() => consumer),
      })),
    }));
    const sendNotification = jest.fn();
    jest.doMock("../../src/services/SseManagerService", () => ({
      __esModule: true,
      default: { sendNotification },
    }));
    const warn = jest.spyOn(console, "warn").mockImplementation();

    await jest.isolateModulesAsync(async () => {
      const KafkaConsumer = require("../../src/kafka/KafkaConsumer").default;

      await KafkaConsumer.start();
      await eachMessage?.({
        topic: "notification.created",
        partition: 0,
        message: { value: null, offset: "1" },
      });
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("without a value"),
    );
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("throws invalid JSON messages after logging the parse failure", async () => {
    let eachMessage:
      | ((payload: {
          topic: string;
          partition: number;
          message: { value: Buffer; offset: string };
        }) => Promise<void>)
      | undefined;
    const consumer = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn(async (options) => {
        eachMessage = options.eachMessage;
      }),
    };
    jest.doMock("kafkajs", () => ({
      Kafka: jest.fn(() => ({
        consumer: jest.fn(() => consumer),
      })),
    }));
    jest.doMock("../../src/services/SseManagerService", () => ({
      __esModule: true,
      default: { sendNotification: jest.fn() },
    }));
    const error = jest.spyOn(console, "error").mockImplementation();

    await jest.isolateModulesAsync(async () => {
      const KafkaConsumer = require("../../src/kafka/KafkaConsumer").default;

      await KafkaConsumer.start();
      await expect(
        eachMessage?.({
          topic: "notification.created",
          partition: 0,
          message: { value: Buffer.from("{bad-json"), offset: "2" },
        }),
      ).rejects.toThrow();
    });

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to parse Kafka event"),
    );
  });
});
