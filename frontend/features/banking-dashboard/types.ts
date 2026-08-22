export type TransactionType = "CREDIT" | "DEBIT";
export type BankingView = "dashboard" | "transfer" | "services" | "profile";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export interface NotificationEvent {
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

export interface TransactionResponse {
  event: {
    eventId: string;
    occurredAt: string;
    data: {
      transactionId: string;
      userId: string;
      accountId: string;
      type: TransactionType;
      amount: number;
      status: "PENDING";
    };
  };
}
