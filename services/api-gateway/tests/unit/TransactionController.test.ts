import { Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import HealthController from "../../src/controllers/HealthController";
import TransactionController from "../../src/controllers/TransactionController";
import { producer } from "../../src/kafka/KafkaService";

jest.mock("../../src/kafka/KafkaService", () => ({
  producer: {
    send: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
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

  it("returns health status", () => {
    const req = {} as Request;
    const res = mockResponse();

    HealthController.healthCheck(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      service: "api-gateway",
      status: "ok",
    });
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

    expect(producer.send).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: "transaction.created",
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
    expect(producer.send).not.toHaveBeenCalled();
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
    expect(producer.send).not.toHaveBeenCalled();
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
    expect(producer.send).not.toHaveBeenCalled();
  });
});
