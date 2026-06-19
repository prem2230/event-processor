import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";

const envConfig = {
  nodeEnv,
  logFormat: (
    process.env.LOG_FORMAT || (nodeEnv === "development" ? "pretty" : "json")
  ).toLowerCase(),
  logLevel: (process.env.LOG_LEVEL || "info").toLowerCase(),
  levelPriority: { error: 0, warn: 1, info: 2 },
  port: process.env.PORT || "3000",
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "banking-event-platform",
  kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
  kafkaTransactionCreatedTopic:
    process.env.KAFKA_TRANSACTION_CREATED_TOPIC || "transaction.created",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "transaction-processors",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/banking",
  redisUri: process.env.REDIS_URL || "redis://localhost:6379",
};

export default envConfig;
