import type {
  AccountDocument,
  AccountResponse,
  CreateAccountRequest,
  BalanceMutationRequest,
} from "../interfaces";
import AccountModel from "../models/AccountModel";
import IdGenerator from "../utils/idGenerator";
import Logger from "../utils/logger";

class AccountService {
  private static readonly logger = Logger;
  private static readonly accountModel = AccountModel;
  private static readonly idGenerator = IdGenerator;

  public static async create(
    userId: string,
    data: CreateAccountRequest,
  ): Promise<AccountResponse> {
    if (!["CURRENT", "SAVINGS", "DEPOSIT"].includes(data.type)) {
      throw new Error("INVALID_ACCOUNT_TYPE");
    }
    const account = await this.accountModel.create({
      accountId: this.idGenerator.generateId(),
      userId,
      type: data.type,
      currency: (data.currency || "INR").toUpperCase(),
      balance: 0,
      availableBalance: 0,
      appliedPaymentIds: [],
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

  public static async applyBalanceMutation(
    userId: string,
    accountId: string,
    data: BalanceMutationRequest,
  ): Promise<{ account: AccountResponse; alreadyApplied: boolean }> {
    if (!data.paymentId || !["CREDIT", "DEBIT"].includes(data.type)) {
      throw new Error("INVALID_TRANSACTION");
    }
    if (typeof data.amount !== "number" || data.amount <= 0) {
      throw new Error("INVALID_TRANSACTION_AMOUNT");
    }

    const amountDelta = data.type === "CREDIT" ? data.amount : -data.amount;
    const result = await this.accountModel.applyPaymentMutation(
      accountId,
      userId,
      data.paymentId,
      amountDelta,
      data.type === "DEBIT" ? data.amount : undefined,
    );

    if (!result.account) {
      throw new Error("ACCOUNT_NOT_FOUND_OR_INSUFFICIENT_FUNDS");
    }

    return { account: this.toResponse(result.account), alreadyApplied: result.alreadyApplied };
  }

  private static toResponse(account: AccountDocument): AccountResponse {
    return {
      accountId: account.accountId,
      userId: account.userId,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      availableBalance: account.availableBalance,
      status: account.status,
      createdAt: account.createdAt,
    };
  }
}

export default AccountService;
