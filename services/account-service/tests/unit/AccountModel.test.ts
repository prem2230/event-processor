import { afterEach, describe, expect, it, jest } from "@jest/globals";
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

describe("AccountModel", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("delegates persistence operations to mongoose", async () => {
    const sort = jest.fn<Promise<string[]>, []>().mockResolvedValue(["account"]);
    const model = {
      create: jest.fn().mockResolvedValue({ accountId: "account-1" } as any),
      find: jest.fn<(filter: { userId: string }) => { sort: jest.Mock<any, any> }>(() => ({ sort })),
      findOne: jest.fn().mockResolvedValue(null),
      findOneAndUpdate: jest.fn().mockResolvedValue({ accountId: "account-1" }),
    };
    const Schema = jest.fn();
    jest.doMock("mongoose", () => ({
      __esModule: true,
      default: {
        Schema,
        model: jest.fn(() => model),
      },
    }));

    await jest.isolateModulesAsync(async () => {
      const AccountModel = require("../../src/models/AccountModel").default;

      await expect(
        AccountModel.create({
          accountId: "account-1",
          userId: "user-1",
          type: "CURRENT",
          currency: "INR",
          balance: 0,
          status: "ACTIVE",
        }),
      ).resolves.toEqual({ accountId: "account-1" });
      await expect(AccountModel.findByUserId("user-1")).resolves.toEqual([
        "account",
      ]);
      await expect(
        AccountModel.findOwnedAccount("account-1", "user-1"),
      ).resolves.toBeNull();
      await expect(
        AccountModel.applyTransaction("account-1", "user-1", 100),
      ).resolves.toEqual({ accountId: "account-1" });
    });

    expect(model.create).toHaveBeenCalledWith({
      accountId: "account-1",
      userId: "user-1",
      type: "CURRENT",
      currency: "INR",
      balance: 0,
      status: "ACTIVE",
    });
    expect(model.find).toHaveBeenCalledWith({ userId: "user-1" });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(model.findOne).toHaveBeenCalledWith({
      accountId: "account-1",
      userId: "user-1",
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      {
        accountId: "account-1",
        userId: "user-1",
        status: "ACTIVE",
      },
      { $inc: { balance: 100 } },
      { new: true },
    );
  });
});
