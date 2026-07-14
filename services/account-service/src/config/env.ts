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
  public static readonly port = Number(process.env.PORT) || 3005;
  public static readonly mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/accounts";
  public static readonly internalServiceToken =
    process.env.INTERNAL_SERVICE_TOKEN || "local-internal-service-token";
  public static readonly kafkaBroker =
    process.env.KAFKA_BROKER || "localhost:9092";
  public static readonly kafkaClientId =
    process.env.KAFKA_CLIENT_ID || "account-service";
  public static readonly kafkaTransactionCreatedTopic =
    process.env.KAFKA_TRANSACTION_CREATED_TOPIC || "transaction.created";

  public static validateProductionSecrets(): void {
    if (
      this.nodeEnv === "production" &&
      this.internalServiceToken === "local-internal-service-token"
    ) {
      throw new Error("Production internal service token is not configured");
    }
  }
}

export default EnvConfig;
