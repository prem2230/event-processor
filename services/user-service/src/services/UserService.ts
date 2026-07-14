import type {
  RegisterUserRequest,
  UserDocument,
  UserProfile,
  VerifyCredentialsRequest,
} from "../interfaces";
import UserModel from "../models/UserModel";
import IdGenerator from "../utils/idGenerator";
import Logger from "../utils/logger";
import PasswordService from "./PasswordService";

class UserService {
  private static readonly logger = Logger;
  private static readonly userModel = UserModel;
  private static readonly passwordService = PasswordService;
  private static readonly idGenerator = IdGenerator;

  public static async register(
    data: RegisterUserRequest,
  ): Promise<UserProfile> {
    this.validateRegistration(data);
    if (await this.userModel.findByEmail(data.email)) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }

    const password = await this.passwordService.hash(data.password);
    const user = await this.userModel.create({
      userId: this.idGenerator.generateId(),
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      ...password,
      status: "ACTIVE",
    });

    this.logger.info("User registered");
    return this.toProfile(user);
  }

  public static async verifyCredentials(
    data: VerifyCredentialsRequest,
  ): Promise<UserProfile | null> {
    const user = await this.userModel.findByEmail(data.email);
    if (!user || user.status !== "ACTIVE") return null;

    const valid = await this.passwordService.verify(
      data.password,
      user.passwordHash,
      user.passwordSalt,
    );
    this.logger.info("Credential verification completed", { success: valid });
    return valid ? this.toProfile(user) : null;
  }

  public static async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.userModel.findByUserId(userId);
    return user ? this.toProfile(user) : null;
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
