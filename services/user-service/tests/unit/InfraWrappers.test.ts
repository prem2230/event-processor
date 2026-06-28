/* eslint-disable @typescript-eslint/no-require-imports */

describe("infrastructure wrappers", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("validates production secrets", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      INTERNAL_SERVICE_TOKEN: "",
    };

    jest.isolateModules(() => {
      const EnvConfig = require("../../src/config/env").default;
      expect(() => EnvConfig.validateProductionSecrets()).toThrow(
        "Production internal service token is not configured",
      );
    });

    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      INTERNAL_SERVICE_TOKEN: "service-token",
    };

    jest.isolateModules(() => {
      const EnvConfig = require("../../src/config/env").default;
      expect(() => EnvConfig.validateProductionSecrets()).not.toThrow();
    });

    process.env = originalEnv;
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

    expect(connect).toHaveBeenCalledWith("mongodb://localhost:27017/users");
  });

  it("delegates user model operations to mongoose", async () => {
    const model = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ userId: "user-1" }),
    };
    jest.doMock("mongoose", () => ({
      __esModule: true,
      default: {
        Schema: jest.fn(),
        model: jest.fn(() => model),
      },
    }));

    await jest.isolateModulesAsync(async () => {
      const UserModel = require("../../src/models/UserModel").default;

      await expect(UserModel.findByEmail("USER@EXAMPLE.COM")).resolves.toBeNull();
      await expect(UserModel.findByUserId("user-1")).resolves.toBeNull();
      await expect(
        UserModel.create({
          userId: "user-1",
          email: "user@example.com",
          firstName: "Test",
          lastName: "User",
          passwordHash: "hash",
          passwordSalt: "salt",
          status: "ACTIVE",
        }),
      ).resolves.toEqual({ userId: "user-1" });
    });

    expect(model.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(model.findOne).toHaveBeenCalledWith({ userId: "user-1" });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
    );
  });
});
