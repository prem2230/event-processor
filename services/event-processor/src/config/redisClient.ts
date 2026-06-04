import { createClient } from "redis";
import envConfig from "../config/env";

export const redisClient = createClient({
    url: envConfig.redisUrl,
});

redisClient.on("error", (error) => {
    console.error("Redis error", error);
});

export async function connectRedis(): Promise<void> {
    await redisClient.connect();
    console.log("Redis connected");
}