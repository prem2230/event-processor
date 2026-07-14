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
  public static readonly port = Number(process.env.PORT) || 3002;
  public static readonly kafkaBroker =
    process.env.KAFKA_BROKER || "localhost:9092";
  public static readonly kafkaClientId =
    process.env.KAFKA_CLIENT_ID || "notification-service";
  public static readonly kafkaGroupId =
    process.env.KAFKA_GROUP_ID || "notification-service-group";
  public static readonly kafkaNotificationCreatedTopic =
    process.env.KAFKA_NOTIFICATION_CREATED_TOPIC || "notification.created";
}

export default EnvConfig;
