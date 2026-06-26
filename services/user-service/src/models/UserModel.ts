import mongoose from "mongoose";

export interface UserDocument {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  passwordSalt: string;
  status: "ACTIVE" | "LOCKED";
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
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
