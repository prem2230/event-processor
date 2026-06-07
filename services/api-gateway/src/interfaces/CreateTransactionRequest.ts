import { TransactionType } from "../types";

export interface TransactionCreatedEvent {
    eventId: string;
    eventType: string;
    occurredAt: string;
    data: {
        transactionId: string;
        userId: string;
        accountId: string;
        type: TransactionType;
        amount: number;
        status: "PENDING";
    };
}
