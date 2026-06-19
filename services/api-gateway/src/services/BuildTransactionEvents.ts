import envConfig from "../config/env";
import {
  CreateTransactionRequest,
  TransactionCreatedEvent,
} from "../interfaces";
import IdGenerator from "../utils/idGenerator";
import Logger from "../utils/logger";

class BuildTransactionEvents {
  private static readonly logger = Logger;
  private static readonly transactionCreatedTopic =
    envConfig.kafkaTransactionCreatedTopic;

  public static buildTransactionCreatedEvent(
    data: CreateTransactionRequest,
  ): TransactionCreatedEvent {
    BuildTransactionEvents.logger.info("Building transaction created event", {
      userId: data.userId,
      accountId: data.accountId,
    });
    return {
      eventId: IdGenerator.generateId(),
      eventType: BuildTransactionEvents.transactionCreatedTopic,
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: IdGenerator.generateId(),
        userId: data.userId,
        accountId: data.accountId,
        type: data.type,
        amount: data.amount,
        status: "PENDING",
      },
    };
  }
}

export default BuildTransactionEvents;
