import { processTransaction } from "../../src/processors/TransactionProcessor";
import { redisClient } from "../../src/config/redisClient";
import { TransactionModel } from "../../src/models/TransactionModel";
import { publishNotificationCreated } from "../../src/kafka/KafkaProducer";
import { TransactionCreatedEvent } from "../../src/interfaces";

jest.mock("../../src/config/redisClient", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("../../src/models/TransactionModel", () => ({
  TransactionModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/kafka/KafkaProducer", () => ({
  publishNotificationCreated: jest.fn(),
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
    jest.mocked(TransactionModel.findOne).mockResolvedValue(null);
    jest.mocked(redisClient.get).mockResolvedValue("1000");
    jest.mocked(TransactionModel.create).mockResolvedValue({} as never);
    jest.mocked(redisClient.set).mockResolvedValue("OK");
    jest.mocked(publishNotificationCreated).mockResolvedValue(undefined);

    await processTransaction(transactionEvent);

    expect(TransactionModel.findOne).toHaveBeenCalledWith({
      transactionId: "txn-1",
    });
    expect(TransactionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: "txn-1",
        eventId: "event-1",
        status: "COMPLETED",
      })
    );
    expect(redisClient.set).toHaveBeenCalledWith(
      "account:acc-5001:balance",
      "3500"
    );
    expect(publishNotificationCreated).toHaveBeenCalledWith({
      userId: "user-101",
      transactionId: "txn-1",
      accountId: "acc-5001",
      status: "COMPLETED",
      message: "Transaction completed successfully",
      updatedBalance: 3500,
    });
  });

  it("deducts balance for debit transactions", async () => {
    jest.mocked(TransactionModel.findOne).mockResolvedValue(null);
    jest.mocked(redisClient.get).mockResolvedValue("4000");

    await processTransaction({
      ...transactionEvent,
      data: {
        ...transactionEvent.data,
        type: "DEBIT",
        amount: 1500,
      },
    });

    expect(redisClient.set).toHaveBeenCalledWith(
      "account:acc-5001:balance",
      "2500"
    );
  });

  it("ignores duplicate transactions", async () => {
    jest.mocked(TransactionModel.findOne).mockResolvedValue({} as never);

    await processTransaction(transactionEvent);

    expect(TransactionModel.create).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(publishNotificationCreated).not.toHaveBeenCalled();
  });
});
