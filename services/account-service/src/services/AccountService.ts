import { randomUUID } from "node:crypto";
import type {
  AccountDocument,
  AccountResponse,
  CreateAccountRequest,
} from "../interfaces";
import AccountModel from "../models/AccountModel";
import Logger from "../utils/logger";

class AccountService {
  private static readonly logger = Logger;
  private static readonly accountModel = AccountModel;

  public static async create(
    userId: string,
    data: CreateAccountRequest,
  ): Promise<AccountResponse> {
    if (!["CURRENT", "SAVINGS"].includes(data.type)) {
      throw new Error("INVALID_ACCOUNT_TYPE");
    }
    const account = await this.accountModel.create({
      accountId: randomUUID(),
      userId,
      type: data.type,
      currency: (data.currency || "INR").toUpperCase(),
      status: "ACTIVE",
    });
    this.logger.info("Account created", {
      accountType: account.type,
    });
    return this.toResponse(account);
  }

  public static async list(userId: string): Promise<AccountResponse[]> {
    return (await this.accountModel.findByUserId(userId)).map(this.toResponse);
  }

  public static async get(
    accountId: string,
    userId: string,
  ): Promise<AccountResponse | null> {
    const account = await this.accountModel.findOwnedAccount(accountId, userId);
    return account ? this.toResponse(account) : null;
  }

  private static toResponse(account: AccountDocument): AccountResponse {
    return {
      accountId: account.accountId,
      userId: account.userId,
      type: account.type,
      currency: account.currency,
      status: account.status,
      createdAt: account.createdAt,
    };
  }
}

export default AccountService;
