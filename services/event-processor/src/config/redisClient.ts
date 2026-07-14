import { createClient } from "redis";
import envConfig from "./env";
import Logger from "../utils/logger";

class RedisService {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;
  private static readonly client = createClient({
    url: this.envConfig.redisUrl,
  });

  static {
    this.client.on("error", (error) => {
      this.logger.error("Redis client error", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  public static async connect(): Promise<void> {
    this.logger.info("Connecting to Redis");
    await this.client.connect();
    this.logger.info("Redis connected");
  }

  public static async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public static async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  public static isReady(): boolean {
    return this.client.isReady;
  }
}

export default RedisService;
