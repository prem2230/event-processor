import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("infrastructure wrappers", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("connects MongoDB using the configured URI and reports readiness", async () => {
    const connect = jest.fn().mockResolvedValue(undefined);
    jest.doMock("mongoose", () => ({
      __esModule: true,
      default: {
        connection: { readyState: 1 },
        connect,
      },
    }));

    await jest.isolateModulesAsync(async () => {
      const MongoConnection = require("../../src/config/mongo").default;

      expect(MongoConnection.isReady()).toBe(true);
      await MongoConnection.connect();
    });

    expect(connect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/event_processor",
    );
  });

  it("delegates Redis operations to the client", async () => {
    const client = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue("10"),
      set: jest.fn().mockResolvedValue("OK"),
      isReady: true,
    };
    jest.doMock("redis", () => ({
      createClient: jest.fn(() => client),
    }));

    await jest.isolateModulesAsync(async () => {
      const RedisService = require("../../src/config/redisClient").default;

      await RedisService.connect();
      await expect(RedisService.get("balance")).resolves.toBe("10");
      await RedisService.set("balance", "20");
      expect(RedisService.isReady()).toBe(true);
    });

    expect(client.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(client.connect).toHaveBeenCalled();
    expect(client.get).toHaveBeenCalledWith("balance");
    expect(client.set).toHaveBeenCalledWith("balance", "20");
  });

  it("logs Redis client errors", async () => {
    let errorHandler: ((error: unknown) => void) | undefined;
    jest.doMock("redis", () => ({
      createClient: jest.fn(() => ({
        on: jest.fn((_event: string, handler: (error: unknown) => void) => {
          errorHandler = handler;
        }),
        connect: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        isReady: false,
      })),
    }));
    const error = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await jest.isolateModulesAsync(async () => {
      require("../../src/config/redisClient");
      errorHandler?.(new Error("redis down"));
      errorHandler?.("redis string failure");
    });

    expect(error).toHaveBeenCalledWith(expect.stringContaining("redis down"));
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("redis string failure"),
    );
  });

  it("delegates transaction model operations to mongoose", async () => {
    const model = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn<Promise<{ transactionId: string }>, []>().mockResolvedValue({ transactionId: "txn-1" }),
    };
    jest.doMock("mongoose", () => ({
      __esModule: true,
      default: {
        Schema: jest.fn(),
        model: jest.fn(() => model),
      },
    }));

    await jest.isolateModulesAsync(async () => {
      const TransactionModel =
        require("../../src/models/TransactionModel").default;

      await expect(
        TransactionModel.findByTransactionId("txn-1"),
      ).resolves.toBeNull();
      await expect(
        TransactionModel.create({
          transactionId: "txn-1",
          eventId: "event-1",
          userId: "user-1",
          accountId: "account-1",
          type: "CREDIT",
          amount: 100,
          status: "COMPLETED",
          processedAt: new Date("2026-01-01"),
        }),
      ).resolves.toEqual({ transactionId: "txn-1" });
    });

    expect(model.findOne).toHaveBeenCalledWith({ transactionId: "txn-1" });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: "txn-1" }),
    );
  });
});
