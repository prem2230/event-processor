/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, afterEach, it, expect, jest } from "@jest/globals";

describe("EnvConfig", () => {
  const originalEnv = process.env;

  afterEach(() => {
    jest.resetModules();
    process.env = originalEnv;
  });

  it("rejects default internal token in production", () => {
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
  });

  it("accepts configured production secrets", () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      INTERNAL_SERVICE_TOKEN: "service-token",
    };

    jest.isolateModules(() => {
      const EnvConfig = require("../../src/config/env").default;
      expect(() => EnvConfig.validateProductionSecrets()).not.toThrow();
    });
  });
});
