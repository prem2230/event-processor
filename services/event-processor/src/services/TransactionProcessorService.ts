import type { TransactionCreatedEvent } from "../interfaces";
import KafkaProducer from "../kafka/KafkaProducer";
import TransactionModel from "../models/TransactionModel";
import Logger from "../utils/logger";

class TransactionProcessor {
  private static readonly logger = Logger;
  private static readonly transactionModel = TransactionModel;
  private static readonly kafkaProducer = KafkaProducer;

  public static async process(event: TransactionCreatedEvent): Promise<void> {
    const startedAt = Date.now();
    const transaction = event.data;

    TransactionProcessor.logger.info("Transaction processing started", {
      eventId: event.eventId,
      transactionId: transaction.transactionId,
      transactionType: transaction.type,
    });

    const existingTransaction =
      await TransactionProcessor.transactionModel.findByTransactionId(
        transaction.transactionId,
      );

    if (existingTransaction) {
      TransactionProcessor.logger.warn("Duplicate transaction ignored", {
        eventId: event.eventId,
        transactionId: transaction.transactionId,
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    await TransactionProcessor.transactionModel.create({
      transactionId: transaction.transactionId,
      eventId: event.eventId,
      userId: transaction.userId,
      accountId: transaction.accountId,
      type: transaction.type,
      amount: transaction.amount,
      status: "COMPLETED",
      processedAt: new Date(),
    });

    await TransactionProcessor.kafkaProducer.publishNotificationCreated({
      userId: transaction.userId,
      transactionId: transaction.transactionId,
      accountId: transaction.accountId,
      status: "COMPLETED",
      message: "Transaction completed successfully",
      updatedBalance: transaction.updatedBalance,
    });

    TransactionProcessor.logger.info("Transaction processed", {
      eventId: event.eventId,
      transactionId: transaction.transactionId,
      status: "COMPLETED",
      durationMs: Date.now() - startedAt,
    });
  }
}

export default TransactionProcessor;
