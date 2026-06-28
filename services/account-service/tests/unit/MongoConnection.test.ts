/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-require-imports */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("MongoConnection", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("reports readiness from mongoose state", () => {
    jest.doMock("mongoose", () => ({
      __esModule: true,
      default: {
        connection: { readyState: 1 },
        connect: jest.fn(),
      },
    }));

    jest.isolateModules(() => {
      const MongoConnection = require("../../src/config/mongo").default;
      expect(MongoConnection.isReady()).toBe(true);
    });
  });

  it("connects using the configured Mongo URI", async () => {
    const connect = jest.fn<Promise<void>>().mockResolvedValue(undefined);
    jest.doMock("mongoose", () => ({
      __esModule: true,
      default: {
        connection: { readyState: 0 },
        connect,
      },
    }));

    await jest.isolateModulesAsync(async () => {
      const MongoConnection = require("../../src/config/mongo").default;
      await MongoConnection.connect();
      expect(connect).toHaveBeenCalledWith("mongodb://localhost:27017/accounts");
    });
  });
});
