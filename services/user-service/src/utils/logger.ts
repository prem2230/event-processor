import envConfig from "../config/env";

type LogLevel = "error" | "warn" | "info";
type LogFormat = "json" | "text" | "pretty";
type LogMeta = Record<string, unknown>;

class Logger {
  private static readonly service = "user-service";
  private static readonly logFormat = envConfig.logFormat as LogFormat;
  private static readonly logLevel = envConfig.logLevel as LogLevel;
  private static readonly priorities: Record<LogLevel, number> =
    envConfig.levelPriority;

  public static info(message: string, meta?: LogMeta): void {
    Logger.write("info", message, meta);
  }

  public static warn(message: string, meta?: LogMeta): void {
    Logger.write("warn", message, meta);
  }

  public static error(message: string, meta?: LogMeta): void {
    Logger.write("error", message, meta);
  }

  private static write(level: LogLevel, message: string, meta?: LogMeta): void {
    if (
      Logger.priorities[level] >
      (Logger.priorities[Logger.logLevel] ?? Logger.priorities.info)
    ) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      service: Logger.service,
      level,
      message,
      ...meta,
    };
    const output =
      Logger.logFormat === "pretty"
        ? JSON.stringify(payload, null, 2)
        : JSON.stringify(payload);

    if (level === "error") console.error(output);
    else if (level === "warn") console.warn(output);
    else console.info(output);
  }
}

export default Logger;
