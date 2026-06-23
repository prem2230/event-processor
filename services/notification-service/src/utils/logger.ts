type LogMeta = Record<string, unknown>;

class Logger {
  public static info(message: string, meta?: LogMeta): void {
    console.info(Logger.format(message, meta));
  }

  public static warn(message: string, meta?: LogMeta): void {
    console.warn(Logger.format(message, meta));
  }

  public static error(message: string, meta?: LogMeta): void {
    console.error(Logger.format(message, meta));
  }

  private static format(message: string, meta?: LogMeta): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    });
  }
}

export default Logger;
