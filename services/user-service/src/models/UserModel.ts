import mongoose from "mongoose";
import { UserDocument } from "../interfaces";

const schema = new mongoose.Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String },
    address: { type: String },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "LOCKED"], default: "ACTIVE" },
  },
  { timestamps: true },
);

const model = mongoose.model<UserDocument>("User", schema);

class UserModel {
  public static findByEmail(email: string): Promise<UserDocument | null> {
    return model.findOne({ email: email.toLowerCase() });
  }

  public static findByUserId(userId: string): Promise<UserDocument | null> {
    return model.findOne({ userId });
  }

  public static create(
    data: Omit<UserDocument, "createdAt" | "updatedAt">,
  ): Promise<UserDocument> {
    return model.create(data);
  }
}

export default UserModel;
