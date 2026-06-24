import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";

class EnvConfig {
  public static readonly nodeEnv = nodeEnv;
  public static readonly logFormat = (
    process.env.LOG_FORMAT || (nodeEnv === "development" ? "pretty" : "json")
  ).toLowerCase();
  public static readonly logLevel = (
    process.env.LOG_LEVEL || "info"
  ).toLowerCase();
  public static readonly levelPriority = { error: 0, warn: 1, info: 2 };
  public static readonly port = Number(process.env.PORT) || 3000;
  public static readonly kafkaClientId =
    process.env.KAFKA_CLIENT_ID || "banking-event-platform";
  public static readonly kafkaBroker =
    process.env.KAFKA_BROKER || "localhost:9092";
  public static readonly kafkaTransactionCreatedTopic =
    process.env.KAFKA_TRANSACTION_CREATED_TOPIC || "transaction.created";
}

export default EnvConfig;
