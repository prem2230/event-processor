import { randomUUID } from "node:crypto";
import type { AccountResponse, CreateAccountRequest } from "../interfaces";
import AccountModel, { type AccountDocument } from "../models/AccountModel";
import Logger from "../utils/logger";

class AccountService {
  public static async create(
    userId: string,
    data: CreateAccountRequest,
  ): Promise<AccountResponse> {
    if (!["CURRENT", "SAVINGS"].includes(data.type)) {
      throw new Error("INVALID_ACCOUNT_TYPE");
    }
    const account = await AccountModel.create({
      accountId: randomUUID(),
      userId,
      type: data.type,
      currency: (data.currency || "INR").toUpperCase(),
      status: "ACTIVE",
    });
    Logger.info("Account created", {
      accountType: account.type,
    });
    return AccountService.toResponse(account);
  }

  public static async list(userId: string): Promise<AccountResponse[]> {
    return (await AccountModel.findByUserId(userId)).map(
      AccountService.toResponse,
    );
  }

  public static async get(
    accountId: string,
    userId: string,
  ): Promise<AccountResponse | null> {
    const account = await AccountModel.findOwnedAccount(accountId, userId);
    return account ? AccountService.toResponse(account) : null;
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
