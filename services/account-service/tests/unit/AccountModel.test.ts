import { afterEach, describe, expect, it, jest } from "@jest/globals";
/* eslint-disable @typescript-eslint/no-require-imports */

describe("AccountModel", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("delegates persistence operations to mongoose", async () => {
    const sort = jest.fn<Promise<string[]>, []>().mockResolvedValue(["account"]);
    const model = {
      // cast the resolved value to any to satisfy TypeScript when jest.fn() has an inferred 'never' type
      create: jest.fn().mockResolvedValue({ accountId: "account-1" } as any),
      find: jest.fn<(filter: { userId: string }) => { sort: jest.Mock<any, any> }>(() => ({ sort })),
      findOne: jest.fn().mockResolvedValue(null),
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
          status: "ACTIVE",
        }),
      ).resolves.toEqual({ accountId: "account-1" });
      await expect(AccountModel.findByUserId("user-1")).resolves.toEqual([
        "account",
      ]);
      await expect(
        AccountModel.findOwnedAccount("account-1", "user-1"),
      ).resolves.toBeNull();
    });

    expect(model.create).toHaveBeenCalledWith({
      accountId: "account-1",
      userId: "user-1",
      type: "CURRENT",
      currency: "INR",
      status: "ACTIVE",
    });
    expect(model.find).toHaveBeenCalledWith({ userId: "user-1" });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(model.findOne).toHaveBeenCalledWith({
      accountId: "account-1",
      userId: "user-1",
    });
  });
});
