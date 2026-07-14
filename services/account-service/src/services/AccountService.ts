import type {
  AccountDocument,
  AccountResponse,
  CreateAccountRequest,
  CreateTransactionRequest,
  TransactionCreatedEvent,
} from "../interfaces";
import KafkaProducer from "../kafka/KafkaProducer";
import AccountModel from "../models/AccountModel";
import IdGenerator from "../utils/idGenerator";
import Logger from "../utils/logger";

class AccountService {
  private static readonly logger = Logger;
  private static readonly accountModel = AccountModel;
  private static readonly idGenerator = IdGenerator;
  private static readonly kafkaProducer = KafkaProducer;

  public static async create(
    userId: string,
    data: CreateAccountRequest,
  ): Promise<AccountResponse> {
    if (!["CURRENT", "SAVINGS"].includes(data.type)) {
      throw new Error("INVALID_ACCOUNT_TYPE");
    }
    const account = await this.accountModel.create({
      accountId: this.idGenerator.generateId(),
      userId,
      type: data.type,
      currency: (data.currency || "INR").toUpperCase(),
      balance: 0,
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

  public static async createTransaction(
    userId: string,
    data: CreateTransactionRequest,
  ): Promise<{ message: string; event: TransactionCreatedEvent }> {
    if (!data.accountId || !["CREDIT", "DEBIT"].includes(data.type)) {
      throw new Error("INVALID_TRANSACTION");
    }
    if (typeof data.amount !== "number" || data.amount <= 0) {
      throw new Error("INVALID_TRANSACTION_AMOUNT");
    }

    const amountDelta = data.type === "CREDIT" ? data.amount : -data.amount;
    const account = await this.accountModel.applyTransaction(
      data.accountId,
      userId,
      amountDelta,
      data.type === "DEBIT" ? data.amount : undefined,
    );

    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND_OR_INSUFFICIENT_FUNDS");
    }

    const event: TransactionCreatedEvent = {
      eventId: this.idGenerator.generateId(),
      eventType: "transaction.created",
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: this.idGenerator.generateId(),
        userId,
        accountId: data.accountId,
        type: data.type,
        amount: data.amount,
        status: "PENDING",
        updatedBalance: account.balance,
      },
    };

    await this.kafkaProducer.publishTransactionCreated(event);
    this.logger.info("Transaction accepted", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      accountId: data.accountId,
    });

    return { message: "Transaction event published", event };
  }

  private static toResponse(account: AccountDocument): AccountResponse {
    return {
      accountId: account.accountId,
      userId: account.userId,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      status: account.status,
      createdAt: account.createdAt,
    };
  }
}

export default AccountService;
