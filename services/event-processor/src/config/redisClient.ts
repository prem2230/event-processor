import { createClient } from "redis";
import envConfig from "./env";
import Logger from "../utils/logger";

class RedisService {
  private static readonly logger = Logger;
  private static readonly client = createClient({
    url: envConfig.redisUrl,
  });

  static {
    RedisService.client.on("error", (error) => {
      RedisService.logger.error("Redis client error", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  public static async connect(): Promise<void> {
    RedisService.logger.info("Connecting to Redis");
    await RedisService.client.connect();
    RedisService.logger.info("Redis connected");
  }

  public static async get(key: string): Promise<string | null> {
    return RedisService.client.get(key);
  }

  public static async set(key: string, value: string): Promise<void> {
    await RedisService.client.set(key, value);
  }

  public static isReady(): boolean {
    return RedisService.client.isReady;
  }
}

export default RedisService;
