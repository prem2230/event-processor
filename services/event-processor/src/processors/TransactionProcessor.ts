import { redisClient } from "../config/redisClient";
import { TransactionCreatedEvent } from "../interfaces";
import { TransactionModel } from "../models/TransactionModel";
import { publishNotificationCreated } from "../kafka/KafkaProducer";

export async function processTransaction(
    event: TransactionCreatedEvent
): Promise<void> {
    const transaction = event.data;

    const existingTransaction = await TransactionModel.findOne({
        transactionId: transaction.transactionId,
    });

    if (existingTransaction) {
        console.log("Duplicate transaction ignored", transaction.transactionId);
        return;
    }

    const balanceKey = `account:${transaction.accountId}:balance`;
    const currentBalance = Number((await redisClient.get(balanceKey)) || 0);

    const updatedBalance =
        transaction.type === "CREDIT"
            ? currentBalance + transaction.amount
            : currentBalance - transaction.amount;

    await TransactionModel.create({
        transactionId: transaction.transactionId,
        eventId: event.eventId,
        userId: transaction.userId,
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount,
        status: "COMPLETED",
        processedAt: new Date(),
    });

    await redisClient.set(balanceKey, updatedBalance.toString());

    await publishNotificationCreated({
        userId: transaction.userId,
        transactionId: transaction.transactionId,
        accountId: transaction.accountId,
        status: "COMPLETED",
        message: "Transaction completed successfully",
        updatedBalance,
    });

    console.log("Transaction processed", {
        transactionId: transaction.transactionId,
        accountId: transaction.accountId,
        updatedBalance,
    });
}