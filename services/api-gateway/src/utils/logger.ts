import configEnv from "../config/env";

type LogLevel = "error" | "warn" | "info";
type LogFormat = "json" | "text" | "pretty";
type LogMeta = Record<string, unknown>;

class Logger {
  private static readonly logFormat = configEnv.logFormat as LogFormat;
  private static readonly logLevel = configEnv.logLevel as LogLevel;
  private static readonly levelPriority: Record<LogLevel, number> =
    configEnv.levelPriority;

  public static info(message: unknown, meta?: LogMeta): void {
    if (!Logger.shouldLog("info")) {
      return;
    }

    console.info(Logger.formatMessage("info", message, meta));
  }

  public static warn(message: unknown, meta?: LogMeta): void {
    if (!Logger.shouldLog("warn")) {
      return;
    }

    console.warn(Logger.formatMessage("warn", message, meta));
  }

  public static error(message: unknown, meta?: LogMeta): void {
    if (!Logger.shouldLog("error")) {
      return;
    }

    console.error(Logger.formatMessage("error", message, meta));
  }

  private static shouldLog(level: LogLevel): boolean {
    return (
      Logger.levelPriority[level] <=
      (Logger.levelPriority[Logger.logLevel] ?? Logger.levelPriority.info)
    );
  }

  private static formatMessage(
    level: LogLevel,
    message: unknown,
    meta?: LogMeta,
  ): string {
    const timestamp = new Date().toISOString();

    if (Logger.logFormat === "json") {
      return Logger.formatJsonMessage(timestamp, level, message, meta);
    }

    if (Logger.logFormat === "pretty") {
      return Logger.formatPrettyMessage(timestamp, level, message, meta);
    }

    return Logger.formatTextMessage(timestamp, level, message, meta);
  }

  private static formatJsonMessage(
    timestamp: string,
    level: LogLevel,
    message: unknown,
    meta?: LogMeta,
  ): string {
    const payload = { timestamp, level, message, ...meta };

    try {
      return JSON.stringify(payload);
    } catch {
      return String(message);
    }
  }

  private static formatTextMessage(
    timestamp: string,
    level: LogLevel,
    message: unknown,
    meta?: LogMeta,
  ): string {
    const normalizedMessage =
      typeof message === "string" ? message : JSON.stringify(message);
    const normalizedMeta =
      meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

    return `${timestamp} [${level.toUpperCase()}] ${normalizedMessage}${normalizedMeta}`;
  }

  private static formatPrettyMessage(
    timestamp: string,
    level: LogLevel,
    message: unknown,
    meta?: LogMeta,
  ): string {
    const payload = { timestamp, level, message, ...meta };

    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(message);
    }
  }
}

export const logger = Logger;
export default Logger;
