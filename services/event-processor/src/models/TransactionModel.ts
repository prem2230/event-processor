import mongoose from "mongoose";
import { TransactionStatus, TransactionType } from "../types";

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
        status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], required: true },
        processedAt: { type: Date, required: true },
    },
    { timestamps: true }
);

export const TransactionModel = mongoose.model<TransactionDocument>(
    "Transaction",
    transactionSchema
);