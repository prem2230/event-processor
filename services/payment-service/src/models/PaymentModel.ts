import mongoose from "mongoose";

export type PaymentStatus = "INITIATED" | "COMPLETED" | "FAILED";
export interface PaymentDocument {
  paymentId: string; idempotencyKey: string; userId: string; sourceAccountId: string;
  destinationAccountId?: string; amount: number; currency: string; status: PaymentStatus;
  failureReason?: string; createdAt: Date; updatedAt: Date;
}
const schema = new mongoose.Schema<PaymentDocument>({
  paymentId: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  sourceAccountId: { type: String, required: true, index: true },
  destinationAccountId: String, amount: { type: Number, min: 0.01, required: true },
  currency: { type: String, default: "INR", required: true },
  status: { type: String, enum: ["INITIATED", "COMPLETED", "FAILED"], required: true }, failureReason: String,
}, { timestamps: true });
const model = mongoose.model<PaymentDocument>("Payment", schema);
export const PaymentModel = {
  create: (payment: Omit<PaymentDocument, "createdAt" | "updatedAt">) => model.create(payment),
  findByIdempotencyKey: (idempotencyKey: string) => model.findOne({ idempotencyKey }),
  complete: (paymentId: string) => model.findOneAndUpdate({ paymentId, status: "INITIATED" }, { status: "COMPLETED" }, { new: true }),
  fail: (paymentId: string, failureReason: string) => model.findOneAndUpdate({ paymentId, status: "INITIATED" }, { status: "FAILED", failureReason }, { new: true }),
};
