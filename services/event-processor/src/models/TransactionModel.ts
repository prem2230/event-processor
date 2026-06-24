import mongoose from "mongoose";
import type { TransactionStatus, TransactionType } from "../types";

interface TransactionDocument {
  transactionId: string;
  eventId: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  processedAt: Date;
}

const transactionSchema = new mongoose.Schema<TransactionDocument>(
  {
    transactionId: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
    accountId: { type: String, required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      required: true,
    },
    processedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const transactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema,
);

class TransactionModel {
  public static async findByTransactionId(
    transactionId: string,
  ): Promise<TransactionDocument | null> {
    return transactionModel.findOne({ transactionId });
  }

  public static async create(
    transaction: TransactionDocument,
  ): Promise<TransactionDocument> {
    return transactionModel.create(transaction);
  }
}

export default TransactionModel;
