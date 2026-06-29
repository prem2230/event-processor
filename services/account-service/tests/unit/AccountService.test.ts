import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AccountModel from "../../src/models/AccountModel";
import KafkaProducer from "../../src/kafka/KafkaProducer";
import AccountService from "../../src/services/AccountService";

jest.mock("../../src/models/AccountModel", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findOwnedAccount: jest.fn(),
    applyTransaction: jest.fn(),
  },
}));
jest.mock("../../src/kafka/KafkaProducer", () => ({
  __esModule: true,
  default: {
    publishTransactionCreated: jest.fn(),
  },
}));

describe("AccountService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an account for the authenticated user", async () => {
    jest.mocked(AccountModel.create).mockImplementation(async (data) => ({
      ...data,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    }));

    const account = await AccountService.create("user-1", { type: "CURRENT" });

    expect(account.userId).toBe("user-1");
    expect(account.currency).toBe("INR");
    expect(account.balance).toBe(0);
    expect(account.status).toBe("ACTIVE");
  });

  it("uppercases supplied currency", async () => {
    jest.mocked(AccountModel.create).mockImplementation(async (data) => ({
      ...data,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    }));

    const account = await AccountService.create("user-1", {
      type: "SAVINGS",
      currency: "usd",
    });

    expect(account.currency).toBe("USD");
  });

  it("rejects unsupported account types", async () => {
    await expect(
      AccountService.create("user-1", { type: "BROKERAGE" as never }),
    ).rejects.toThrow("INVALID_ACCOUNT_TYPE");
    expect(AccountModel.create).not.toHaveBeenCalled();
  });

  it("lists accounts for a user", async () => {
    const createdAt = new Date("2026-01-01");
    jest.mocked(AccountModel.findByUserId).mockResolvedValue([
      {
        accountId: "account-1",
        userId: "user-1",
        type: "CURRENT",
        currency: "INR",
        balance: 0,
        status: "ACTIVE",
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    expect(await AccountService.list("user-1")).toEqual([
      {
        accountId: "account-1",
        userId: "user-1",
        type: "CURRENT",
        currency: "INR",
        balance: 0,
        status: "ACTIVE",
        createdAt,
      },
    ]);
  });

  it("returns an owned account", async () => {
    const createdAt = new Date("2026-01-01");
    jest.mocked(AccountModel.findOwnedAccount).mockResolvedValue({
      accountId: "account-1",
      userId: "user-1",
      type: "SAVINGS",
      currency: "INR",
      balance: 0,
      status: "ACTIVE",
      createdAt,
      updatedAt: createdAt,
    });

    expect(await AccountService.get("account-1", "user-1")).toEqual({
      accountId: "account-1",
      userId: "user-1",
      type: "SAVINGS",
      currency: "INR",
      balance: 0,
      status: "ACTIVE",
      createdAt,
    });
  });

  it("fetches an account only through owner-scoped lookup", async () => {
    jest.mocked(AccountModel.findOwnedAccount).mockResolvedValue(null);

    expect(await AccountService.get("account-1", "user-2")).toBeNull();
    expect(AccountModel.findOwnedAccount).toHaveBeenCalledWith(
      "account-1",
      "user-2",
    );
  });

  it("updates account balance and publishes a transaction event", async () => {
    const createdAt = new Date("2026-01-01");
    jest.mocked(AccountModel.applyTransaction).mockResolvedValue({
      accountId: "account-1",
      userId: "user-1",
      type: "CURRENT",
      currency: "INR",
      balance: 2500,
      status: "ACTIVE",
      createdAt,
      updatedAt: createdAt,
    });
    jest
      .mocked(KafkaProducer.publishTransactionCreated)
      .mockResolvedValue(undefined);

    const result = await AccountService.createTransaction("user-1", {
      accountId: "account-1",
      type: "CREDIT",
      amount: 2500,
    });

    expect(AccountModel.applyTransaction).toHaveBeenCalledWith(
      "account-1",
      "user-1",
      2500,
      undefined,
    );
    expect(KafkaProducer.publishTransactionCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "transaction.created",
        data: expect.objectContaining({
          accountId: "account-1",
          updatedBalance: 2500,
        }),
      }),
    );
    expect(result.message).toBe("Transaction event published");
  });

  it("protects debit transactions from insufficient balances", async () => {
    jest.mocked(AccountModel.applyTransaction).mockResolvedValue(null);

    await expect(
      AccountService.createTransaction("user-1", {
        accountId: "account-1",
        type: "DEBIT",
        amount: 1000,
      }),
    ).rejects.toThrow("ACCOUNT_NOT_FOUND_OR_INSUFFICIENT_FUNDS");
    expect(AccountModel.applyTransaction).toHaveBeenCalledWith(
      "account-1",
      "user-1",
      -1000,
      1000,
    );
  });
});
