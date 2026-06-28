import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class EnvConfig {
  public static readonly nodeEnv = process.env.NODE_ENV || "development";
  public static readonly logFormat = (
    process.env.LOG_FORMAT ||
    (EnvConfig.nodeEnv === "development" ? "pretty" : "json")
  ).toLowerCase();
  public static readonly logLevel = (
    process.env.LOG_LEVEL || "info"
  ).toLowerCase();
  public static readonly levelPriority = { error: 0, warn: 1, info: 2 };
  public static readonly port = Number(process.env.PORT) || 4000;
  public static readonly kafkaBroker =
    process.env.KAFKA_BROKER || "localhost:9092";
  public static readonly kafkaClientId =
    process.env.KAFKA_CLIENT_ID || "event-processor";
  public static readonly kafkaGroupId =
    process.env.KAFKA_GROUP_ID || "transaction-processors";
  public static readonly kafkaTransactionCreatedTopic =
    process.env.KAFKA_TRANSACTION_CREATED_TOPIC || "transaction.created";
  public static readonly kafkaNotificationCreatedTopic =
    process.env.KAFKA_NOTIFICATION_CREATED_TOPIC || "notification.created";
  public static readonly mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/event_processor";
  public static readonly redisUrl =
    process.env.REDIS_URL || "redis://localhost:6379";
}

export default EnvConfig;
