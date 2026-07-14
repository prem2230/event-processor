export type AccountType = "CURRENT" | "SAVINGS";
export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export interface CreateAccountRequest {
  type: AccountType;
  currency?: string;
}

export interface AccountResponse {
  accountId: string;
  userId: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
  createdAt: Date;
}
export interface AccountDocument {
  accountId: string;
  userId: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = "CREDIT" | "DEBIT";

export interface CreateTransactionRequest {
  accountId: string;
  type: TransactionType;
  amount: number;
}

export interface TransactionCreatedEvent {
  eventId: string;
  eventType: "transaction.created";
  occurredAt: string;
  data: {
    transactionId: string;
    userId: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    status: "PENDING";
    updatedBalance: number;
  };
}
