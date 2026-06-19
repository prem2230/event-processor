import type {
  CreateTransactionRequest,
  TransactionInitiationResponse,
} from "../interfaces";
import { producer } from "../kafka/KafkaService";
import Logger from "../utils/logger";
import type { Request, Response } from "express";
import BuildTransactionEvents from "./BuildTransactionEvents";
import envConfig from "../config/env";

class TransactionInitiatorService {
  private static readonly logger = Logger;
  private static readonly transactionCreatedTopic =
    envConfig.kafkaTransactionCreatedTopic;
  private static readonly buildTransactionEvents = BuildTransactionEvents;

  public static getCreateTransactionRequest(
    req: Request<unknown, unknown, CreateTransactionRequest>,
  ): CreateTransactionRequest {
    return req.body;
  }

  public static handleCreateTransactionError(
    error: unknown,
    res: Response,
  ): Response {
    TransactionInitiatorService.logger.error(
      "Failed to publish transaction event",
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return res.status(500).json({
      message: "Failed to publish transaction event",
    });
  }

  public static async initiateTransaction(
    data: CreateTransactionRequest,
  ): Promise<TransactionInitiationResponse> {
    const validationError =
      TransactionInitiatorService.validateCreateTransactionRequest(data);
    if (validationError) {
      TransactionInitiatorService.logger.warn(
        "Create transaction request validation failed",
        {
          userId: data.userId,
          accountId: data.accountId,
          type: data.type,
          validationError,
        },
      );
      return {
        statusCode: 400,
        body: {
          message: validationError,
        },
      };
    }
    const event =
      TransactionInitiatorService.buildTransactionEvents.buildTransactionCreatedEvent(
        data,
      );

    TransactionInitiatorService.logger.info("Publishing transaction event", {
      topic: TransactionInitiatorService.transactionCreatedTopic,
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      userId: event.data.userId,
      accountId: event.data.accountId,
    });

    await producer.send({
      topic: TransactionInitiatorService.transactionCreatedTopic,
      messages: [
        {
          key: data.accountId,
          value: JSON.stringify(event),
        },
      ],
    });

    TransactionInitiatorService.logger.info("Transaction event published", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      userId: event.data.userId,
      accountId: event.data.accountId,
    });

    return {
      statusCode: 202,
      body: {
        message: "Transaction event published",
        event,
      },
    };
  }

  private static validateCreateTransactionRequest(
    data: CreateTransactionRequest,
  ): string | null {
    const { userId, accountId, type, amount } = data;

    if (!userId || !accountId || !type || typeof amount !== "number") {
      TransactionInitiatorService.logger.warn(
        "Invalid create transaction request",
        {
          userId,
          accountId,
          type,
        },
      );
      return "userId, accountId, type, and amount are required";
    }

    if (!["CREDIT", "DEBIT"].includes(type)) {
      TransactionInitiatorService.logger.warn("Invalid transaction type", {
        type,
      });
      return "type must be CREDIT or DEBIT";
    }

    if (amount <= 0) {
      TransactionInitiatorService.logger.warn("Invalid transaction amount", {
        userId,
        accountId,
        type,
      });
      return "amount must be greater than 0";
    }

    return null;
  }
}

export default TransactionInitiatorService;
