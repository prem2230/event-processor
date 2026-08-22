import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  logFormat: (process.env.LOG_FORMAT || "json").toLowerCase() === "pretty" ? "pretty" as const : "json" as const,
  logLevel: ((process.env.LOG_LEVEL || "info").toLowerCase() as "error" | "warn" | "info"),
  port: Number(process.env.PORT) || 3006,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/payments",
  accountServiceUrl: process.env.ACCOUNT_SERVICE_URL || "http://localhost:3005",
  internalToken: process.env.INTERNAL_SERVICE_TOKEN || "local-internal-service-token",
  kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
  notificationTopic: process.env.KAFKA_NOTIFICATION_TOPIC || "notification.created",
};
