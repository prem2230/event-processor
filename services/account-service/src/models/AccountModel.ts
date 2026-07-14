import mongoose from "mongoose";
import type { AccountDocument } from "../interfaces";

const schema = new mongoose.Schema<AccountDocument>(
  {
    accountId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ["CURRENT", "SAVINGS"], required: true },
    currency: { type: String, required: true, default: "INR" },
    balance: { type: Number, required: true, default: 0 },
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
}

export default AccountModel;
