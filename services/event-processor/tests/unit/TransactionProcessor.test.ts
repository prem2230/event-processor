import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TransactionCreatedEvent } from "../../src/interfaces";
import KafkaProducer from "../../src/kafka/KafkaProducer";
import TransactionModel from "../../src/models/TransactionModel";
import TransactionProcessor from "../../src/services/TransactionProcessorService";

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
    updatedBalance: 3500,
  },
};

describe("TransactionProcessor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves a new transaction and publishes notification", async () => {
    jest.mocked(TransactionModel.findByTransactionId).mockResolvedValue(null);
    jest.mocked(TransactionModel.create).mockResolvedValue({} as never);
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
    expect(KafkaProducer.publishNotificationCreated).toHaveBeenCalledWith({
      userId: "user-101",
      transactionId: "txn-1",
      accountId: "acc-5001",
      status: "COMPLETED",
      message: "Transaction completed successfully",
      updatedBalance: 3500,
    });
  });

  it("ignores duplicate transactions", async () => {
    jest
      .mocked(TransactionModel.findByTransactionId)
      .mockResolvedValue({} as never);

    await TransactionProcessor.process(transactionEvent);

    expect(TransactionModel.create).not.toHaveBeenCalled();
    expect(KafkaProducer.publishNotificationCreated).not.toHaveBeenCalled();
  });
});
