import mongoose from "mongoose";
import type { AccountDocument } from "../interfaces";

const schema = new mongoose.Schema<AccountDocument>(
  {
    accountId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ["CURRENT", "SAVINGS", "DEPOSIT"], required: true },
    currency: { type: String, required: true, default: "INR" },
    balance: { type: Number, required: true, default: 0 },
    availableBalance: { type: Number, required: true, default: 0 },
    appliedPaymentIds: { type: [String], required: true, default: [] },
    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN", "CLOSED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

const model = mongoose.model<AccountDocument>("Account", schema);

class AccountModel {
  public static create(
    data: Omit<AccountDocument, "createdAt" | "updatedAt">,
  ): Promise<AccountDocument> {
    return model.create(data);
  }
  public static findByUserId(userId: string): Promise<AccountDocument[]> {
    return model.find({ userId }).sort({ createdAt: -1 });
  }
  public static findOwnedAccount(
    accountId: string,
    userId: string,
  ): Promise<AccountDocument | null> {
    return model.findOne({ accountId, userId });
  }
  public static applyTransaction(
    accountId: string,
    userId: string,
    amountDelta: number,
    minimumBalance?: number,
  ): Promise<AccountDocument | null> {
    return model.findOneAndUpdate(
      {
        accountId,
        userId,
        status: "ACTIVE",
        ...(minimumBalance === undefined
          ? {}
          : { balance: { $gte: minimumBalance } }),
      },
      { $inc: { balance: amountDelta } },
      { new: true },
    );
  }

  public static async applyPaymentMutation(
    accountId: string,
    userId: string,
    paymentId: string,
    amountDelta: number,
    debitAmount?: number,
  ): Promise<{ account: AccountDocument | null; alreadyApplied: boolean }> {
    const existing = await model.findOne({ accountId, userId, appliedPaymentIds: paymentId });
    if (existing) return { account: existing, alreadyApplied: true };
    const account = await model.findOneAndUpdate(
      { accountId, userId, status: "ACTIVE", appliedPaymentIds: { $ne: paymentId }, ...(debitAmount === undefined ? {} : { availableBalance: { $gte: debitAmount } }) },
      { $inc: { balance: amountDelta, availableBalance: amountDelta }, $addToSet: { appliedPaymentIds: paymentId } },
      { new: true },
    );
    return { account, alreadyApplied: false };
  }
}

export default AccountModel;
