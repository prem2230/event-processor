import { randomUUID } from "node:crypto";
import type {
  RegisterUserRequest,
  UserProfile,
  VerifyCredentialsRequest,
} from "../interfaces";
import UserModel, { type UserDocument } from "../models/UserModel";
import Logger from "../utils/logger";
import PasswordService from "./PasswordService";

class UserService {
  public static async register(data: RegisterUserRequest): Promise<UserProfile> {
    UserService.validateRegistration(data);
    if (await UserModel.findByEmail(data.email)) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }

    const password = await PasswordService.hash(data.password);
    const user = await UserModel.create({
      userId: randomUUID(),
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      ...password,
      status: "ACTIVE",
    });

    Logger.info("User registered");
    return UserService.toProfile(user);
  }

  public static async verifyCredentials(
    data: VerifyCredentialsRequest,
  ): Promise<UserProfile | null> {
    const user = await UserModel.findByEmail(data.email);
    if (!user || user.status !== "ACTIVE") return null;

    const valid = await PasswordService.verify(
      data.password,
      user.passwordHash,
      user.passwordSalt,
    );
    Logger.info("Credential verification completed", { success: valid });
    return valid ? UserService.toProfile(user) : null;
  }

  public static async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await UserModel.findByUserId(userId);
    return user ? UserService.toProfile(user) : null;
  }

  private static validateRegistration(data: RegisterUserRequest): void {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      throw new Error("INVALID_REGISTRATION");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("INVALID_EMAIL");
    }
    if (data.password.length < 12) {
      throw new Error("WEAK_PASSWORD");
    }
  }

  private static toProfile(user: UserDocument): UserProfile {
    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}

export default UserService;
