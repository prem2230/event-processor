/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest, afterEach } from "@jest/globals";

describe("Logger", () => {
  const originalEnv = process.env;

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it("writes info, warning, and error logs", () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    jest.isolateModules(() => {
      const Logger = require("../../src/utils/logger").default;
      Logger.info("info message", { eventId: "event-1" });
      Logger.warn("warn message");
      Logger.error("error message");
    });

    expect(info).toHaveBeenCalledWith(expect.stringContaining("info message"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("warn message"));
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("error message"),
    );
  });

  it("filters logs below the configured level", () => {
    process.env = { ...originalEnv, LOG_LEVEL: "error" };
    const info = jest.spyOn(console, "info").mockImplementation(() => {});

    jest.isolateModules(() => {
      const Logger = require("../../src/utils/logger").default;
      Logger.info("filtered");
    });

    expect(info).not.toHaveBeenCalled();
  });
});
