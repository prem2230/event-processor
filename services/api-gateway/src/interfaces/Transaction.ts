import { TransactionType } from "../types";

export interface CreateTransactionRequest {
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
}
