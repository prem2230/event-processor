import { describe, it, expect, afterEach, jest } from '@jest/globals';
/* eslint-disable @typescript-eslint/no-require-imports */

describe("HealthService", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("reports ready when Mongo is connected", () => {
    jest.doMock("../../src/config/mongo", () => ({
      __esModule: true,
      default: { isReady: jest.fn(() => true) },
    }));

    jest.isolateModules(() => {
      const HealthService = require("../../src/services/HealthService").default;
      expect(HealthService.getReadiness()).toEqual({
        ready: true,
        checks: { mongo: true },
      });
    });
  });

  it("reports not ready when Mongo is disconnected", () => {
    jest.doMock("../../src/config/mongo", () => ({
      __esModule: true,
      default: { isReady: jest.fn(() => false) },
    }));

    jest.isolateModules(() => {
      const HealthService = require("../../src/services/HealthService").default;
      expect(HealthService.getReadiness()).toEqual({
        ready: false,
        checks: { mongo: false },
      });
    });
  });
});

