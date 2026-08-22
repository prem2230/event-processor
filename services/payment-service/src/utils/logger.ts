import { config } from "../config";
type LogLevel = "error" | "warn" | "info";
class Logger {
  private static readonly priority: Record<LogLevel, number> = { error: 0, warn: 1, info: 2 };
  static info(message: string, meta: Record<string, unknown> = {}): void { this.write("info", message, meta); }
  static warn(message: string, meta: Record<string, unknown> = {}): void { this.write("warn", message, meta); }
  static error(message: string, meta: Record<string, unknown> = {}): void { this.write("error", message, meta); }
  private static write(level: LogLevel, message: string, meta: Record<string, unknown>): void {
    if (this.priority[level] > this.priority[config.logLevel]) return;
    const payload = { timestamp: new Date().toISOString(), service: "payment-service", level, message, ...meta };
    const output = config.logFormat === "pretty" ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
    if (level === "error") console.error(output); else if (level === "warn") console.warn(output); else console.info(output);
  }
}
export default Logger;
