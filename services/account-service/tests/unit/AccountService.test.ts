import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AccountModel from "../../src/models/AccountModel";
import AccountService from "../../src/services/AccountService";

jest.mock("../../src/models/AccountModel", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findOwnedAccount: jest.fn(),
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
      status: "ACTIVE",
      createdAt,
      updatedAt: createdAt,
    });

    expect(await AccountService.get("account-1", "user-1")).toEqual({
      accountId: "account-1",
      userId: "user-1",
      type: "SAVINGS",
      currency: "INR",
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
});
