import { TransactionStatus, TransactionType } from "../types";

export interface TransactionDocument {
    transactionId: string;
    eventId: string;
    userId: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    processedAt: Date;
}