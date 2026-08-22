export interface NotificationCreatedEvent {
    eventId: string;
    eventType: "notification.created";
    occurredAt: string;
    data: {
        userId: string;
        transactionId: string;
        accountId: string;
        status: "INITIATED" | "PENDING" | "COMPLETED" | "FAILED";
        message: string;
        updatedBalance: number;
    };
}
