import { TransactionCreatedEvent } from "./CreateTransactionRequest";

export interface TransactionInitiationResponse {
  statusCode: number;
  body: {
    message: string;
    event?: TransactionCreatedEvent;
  };
}
