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
    const event: TransactionCreatedEvent = {
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

    BuildTransactionEvents.logger.info("Transaction event built", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      eventType: event.eventType,
      transactionType: event.data.type,
    });

    return event;
  }
}

export default BuildTransactionEvents;
