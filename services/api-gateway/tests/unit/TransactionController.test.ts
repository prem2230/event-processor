import { Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import TransactionController from "../../src/controllers/TransactionController";
import KafkaService from "../../src/kafka/KafkaService";

jest.mock("../../src/kafka/KafkaService", () => ({
  __esModule: true,
  default: {
    publishTransactionCreated: jest
      .fn<() => Promise<void>>()
      .mockResolvedValue(undefined),
  },
}));

function mockResponse(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
}

describe("TransactionController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates transaction event and publishes to Kafka", async () => {
    const req = {
      body: {
        userId: "user-101",
        accountId: "acc-5001",
        type: "CREDIT",
        amount: 2500,
      },
    } as Request;

    const res = mockResponse();

    await TransactionController.createTransaction(req, res);

    expect(KafkaService.publishTransactionCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "transaction.created",
        data: expect.objectContaining({
          accountId: "acc-5001",
          amount: 2500,
        }),
      }),
    );

    expect(res.status).toHaveBeenCalledWith(202);
  });

  it("returns 400 when required fields are missing", async () => {
    const req = {
      body: {
        userId: "user-101",
      },
    } as Request;

    const res = mockResponse();

    await TransactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(KafkaService.publishTransactionCreated).not.toHaveBeenCalled();
  });

  it("returns 400 when transaction type is invalid", async () => {
    const req = {
      body: {
        userId: "user-101",
        accountId: "acc-5001",
        type: "TRANSFER",
        amount: 2500,
      },
    } as Request;

    const res = mockResponse();

    await TransactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(KafkaService.publishTransactionCreated).not.toHaveBeenCalled();
  });

  it("returns 400 when amount is not positive", async () => {
    const req = {
      body: {
        userId: "user-101",
        accountId: "acc-5001",
        type: "CREDIT",
        amount: 0,
      },
    } as Request;

    const res = mockResponse();

    await TransactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(KafkaService.publishTransactionCreated).not.toHaveBeenCalled();
  });
});
