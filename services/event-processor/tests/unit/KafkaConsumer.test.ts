/* eslint-disable @typescript-eslint/no-require-imports */

describe("KafkaConsumer", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("starts the consumer and processes messages", async () => {
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
    const process = jest.fn().mockResolvedValue(undefined);
    jest.doMock("../../src/services/TransactionProcessorService", () => ({
      __esModule: true,
      default: { process },
    }));

    await jest.isolateModulesAsync(async () => {
      const KafkaConsumer = require("../../src/kafka/KafkaConsumer").default;

      expect(KafkaConsumer.isReady()).toBe(false);
      await KafkaConsumer.start();
      expect(KafkaConsumer.isReady()).toBe(true);

      await eachMessage?.({
        topic: "transaction.created",
        partition: 0,
        message: {
          offset: "1",
          value: Buffer.from(
            JSON.stringify({
              eventId: "event-1",
              eventType: "transaction.created",
              occurredAt: "2026-06-04T10:00:00.000Z",
              data: {
                transactionId: "txn-1",
                userId: "user-1",
                accountId: "account-1",
                type: "CREDIT",
                amount: 100,
                status: "PENDING",
                updatedBalance: 100,
              },
            }),
          ),
        },
      });
    });

    expect(consumer.connect).toHaveBeenCalled();
    expect(consumer.subscribe).toHaveBeenCalledWith({
      topic: "transaction.created",
      fromBeginning: false,
    });
    expect(process).toHaveBeenCalledWith(
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
    const process = jest.fn();
    jest.doMock("../../src/services/TransactionProcessorService", () => ({
      __esModule: true,
      default: { process },
    }));
    const warn = jest.spyOn(console, "warn").mockImplementation();

    await jest.isolateModulesAsync(async () => {
      const KafkaConsumer = require("../../src/kafka/KafkaConsumer").default;

      await KafkaConsumer.start();
      await eachMessage?.({
        topic: "transaction.created",
        partition: 0,
        message: { value: null, offset: "1" },
      });
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("without a value"),
    );
    expect(process).not.toHaveBeenCalled();
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
    jest.doMock("../../src/services/TransactionProcessorService", () => ({
      __esModule: true,
      default: { process: jest.fn() },
    }));
    const error = jest.spyOn(console, "error").mockImplementation();

    await jest.isolateModulesAsync(async () => {
      const KafkaConsumer = require("../../src/kafka/KafkaConsumer").default;

      await KafkaConsumer.start();
      await expect(
        eachMessage?.({
          topic: "transaction.created",
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
