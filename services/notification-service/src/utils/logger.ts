import envConfig from "../config/env";

type LogLevel = "error" | "warn" | "info";
type LogFormat = "json" | "text" | "pretty";
type LogMeta = Record<string, unknown>;

class Logger {
  private static readonly service = "notification-service";
  private static readonly logFormat = envConfig.logFormat as LogFormat;
  private static readonly logLevel = envConfig.logLevel as LogLevel;
  private static readonly levelPriority: Record<LogLevel, number> =
    envConfig.levelPriority;

  public static info(message: unknown, meta?: LogMeta): void {
    if (Logger.shouldLog("info")) {
      console.info(Logger.formatMessage("info", message, meta));
    }
  }

  public static warn(message: unknown, meta?: LogMeta): void {
    if (Logger.shouldLog("warn")) {
      console.warn(Logger.formatMessage("warn", message, meta));
    }
  }

  public static error(message: unknown, meta?: LogMeta): void {
    if (Logger.shouldLog("error")) {
      console.error(Logger.formatMessage("error", message, meta));
    }
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
    const payload = {
      timestamp: new Date().toISOString(),
      service: Logger.service,
      level,
      message,
      ...meta,
    };

    if (Logger.logFormat === "pretty") {
      return Logger.stringify(payload, 2);
    }

    if (Logger.logFormat === "text") {
      const normalizedMessage =
        typeof message === "string" ? message : JSON.stringify(message);
      const normalizedMeta =
        meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

      return `${payload.timestamp} [${Logger.service.toUpperCase()}] [${level.toUpperCase()}] ${normalizedMessage}${normalizedMeta}`;
    }

    return Logger.stringify(payload);
  }

  private static stringify(payload: unknown, indentation?: number): string {
    try {
      return JSON.stringify(payload, null, indentation);
    } catch {
      return String(payload);
    }
  }
}

export default Logger;
