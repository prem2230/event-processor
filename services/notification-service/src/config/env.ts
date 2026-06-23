import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class EnvConfig {
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
