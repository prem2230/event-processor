import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("Logger", () => {
  const originalEnv = process.env;

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it("writes pretty info, warning, and error logs", () => {
    process.env = { ...originalEnv, LOG_FORMAT: "pretty" };
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

  it("writes text logs with normalized object messages", () => {
    process.env = { ...originalEnv, LOG_FORMAT: "text" };
    const info = jest.spyOn(console, "info").mockImplementation(() => {});

    jest.isolateModules(() => {
      const Logger = require("../../src/utils/logger").default;
      Logger.info({ event: "delivered" }, { durationMs: 7 });
    });

    expect(info).toHaveBeenCalledWith(
      expect.stringContaining(
        '[NOTIFICATION-SERVICE] [INFO] {"event":"delivered"}',
      ),
    );
    expect(info).toHaveBeenCalledWith(expect.stringContaining("durationMs"));
  });

  it("writes JSON logs and falls back for circular payloads", () => {
    process.env = { ...originalEnv, LOG_FORMAT: "json" };
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    jest.isolateModules(() => {
      const Logger = require("../../src/utils/logger").default;
      Logger.info("json message");
      Logger.info(circular);
    });

    expect(info).toHaveBeenCalledWith(expect.stringContaining("json message"));
    expect(info).toHaveBeenCalledWith("[object Object]");
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
