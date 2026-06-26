import type { TransactionType } from "../types";

export interface CreateTransactionHttpRequest {
  accountId: string;
  type: TransactionType;
  amount: number;
}
