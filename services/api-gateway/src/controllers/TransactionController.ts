import { Request, Response } from "express";
import {
  CreateTransactionRequest,
  TransactionCreatedEvent,
} from "../interfaces";
import { producer } from "../kafka/KafkaService";
import { v4 as uuidv4 } from "uuid";

const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    service: "api-gateway",
    status: "ok",
  });
};
const createTransaction = async (
  req: Request<unknown, unknown, CreateTransactionRequest>,
  res: Response,
) => {
  try {
    const { userId, accountId, type, amount } = req.body;

    if (!userId || !accountId || !type || typeof amount !== "number") {
      return res.status(400).json({
        message: "userId, accountId, type, and amount are required",
      });
    }

    if (!["CREDIT", "DEBIT"].includes(type)) {
      return res.status(400).json({
        message: "type must be CREDIT or DEBIT",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "amount must be greater than 0",
      });
    }

    const event: TransactionCreatedEvent = {
      eventId: uuidv4(),
      eventType: "transaction.created",
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: uuidv4(),
        userId,
        accountId,
        type,
        amount,
        status: "PENDING",
      },
    };

    await producer.send({
      topic: "transaction.created",
      messages: [
        {
          key: accountId,
          value: JSON.stringify(event),
        },
      ],
    });

    return res.status(202).json({
      message: "Transaction event published",
      event,
    });
  } catch (error) {
    console.error("Failed to publish transaction event", error);

    return res.status(500).json({
      message: "Failed to publish transaction event",
    });
  }
};

export { healthCheck, createTransaction };
