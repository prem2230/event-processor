import RedisService from "../../src/config/redisClient";
import type { TransactionCreatedEvent } from "../../src/interfaces";
import KafkaProducer from "../../src/kafka/KafkaProducer";
import TransactionModel from "../../src/models/TransactionModel";
import TransactionProcessor from "../../src/processors/TransactionProcessor";

jest.mock("../../src/config/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("../../src/models/TransactionModel", () => ({
  __esModule: true,
  default: {
    findByTransactionId: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/kafka/KafkaProducer", () => ({
  __esModule: true,
  default: {
    publishNotificationCreated: jest.fn(),
  },
}));

const transactionEvent: TransactionCreatedEvent = {
  eventId: "event-1",
  eventType: "transaction.created",
  occurredAt: "2026-06-04T10:00:00.000Z",
  data: {
    transactionId: "txn-1",
    userId: "user-101",
    accountId: "acc-5001",
    type: "CREDIT",
    amount: 2500,
    status: "PENDING",
  },
};

describe("TransactionProcessor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves a new transaction, updates Redis balance, and publishes notification", async () => {
    jest.mocked(TransactionModel.findByTransactionId).mockResolvedValue(null);
    jest.mocked(RedisService.get).mockResolvedValue("1000");
    jest.mocked(TransactionModel.create).mockResolvedValue({} as never);
    jest.mocked(RedisService.set).mockResolvedValue(undefined);
    jest
      .mocked(KafkaProducer.publishNotificationCreated)
      .mockResolvedValue(undefined);

    await TransactionProcessor.process(transactionEvent);

    expect(TransactionModel.findByTransactionId).toHaveBeenCalledWith("txn-1");
    expect(TransactionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: "txn-1",
        eventId: "event-1",
        status: "COMPLETED",
      }),
    );
    expect(RedisService.set).toHaveBeenCalledWith(
      "account:acc-5001:balance",
      "3500",
    );
    expect(KafkaProducer.publishNotificationCreated).toHaveBeenCalledWith({
      userId: "user-101",
      transactionId: "txn-1",
      accountId: "acc-5001",
      status: "COMPLETED",
      message: "Transaction completed successfully",
      updatedBalance: 3500,
    });
  });

  it("deducts balance for debit transactions", async () => {
    jest.mocked(TransactionModel.findByTransactionId).mockResolvedValue(null);
    jest.mocked(RedisService.get).mockResolvedValue("4000");

    await TransactionProcessor.process({
      ...transactionEvent,
      data: {
        ...transactionEvent.data,
        type: "DEBIT",
        amount: 1500,
      },
    });

    expect(RedisService.set).toHaveBeenCalledWith(
      "account:acc-5001:balance",
      "2500",
    );
  });

  it("rejects an overdraft without changing the balance", async () => {
    jest.mocked(TransactionModel.findByTransactionId).mockResolvedValue(null);
    jest.mocked(RedisService.get).mockResolvedValue("400");
    jest.mocked(TransactionModel.create).mockResolvedValue({} as never);
    jest.mocked(KafkaProducer.publishNotificationCreated).mockResolvedValue(undefined);

    await TransactionProcessor.process({
      ...transactionEvent,
      data: { ...transactionEvent.data, type: "DEBIT", amount: 500 },
    });

    expect(RedisService.set).not.toHaveBeenCalled();
    expect(TransactionModel.create).toHaveBeenCalledWith(expect.objectContaining({ status: "FAILED" }));
    expect(KafkaProducer.publishNotificationCreated).toHaveBeenCalledWith(expect.objectContaining({
      status: "FAILED",
      updatedBalance: 400,
    }));
  });

  it("ignores duplicate transactions", async () => {
    jest
      .mocked(TransactionModel.findByTransactionId)
      .mockResolvedValue({} as never);

    await TransactionProcessor.process(transactionEvent);

    expect(TransactionModel.create).not.toHaveBeenCalled();
    expect(RedisService.set).not.toHaveBeenCalled();
    expect(KafkaProducer.publishNotificationCreated).not.toHaveBeenCalled();
  });
});
