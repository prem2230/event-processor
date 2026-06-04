import dotenv from "dotenv";

dotenv.config({ path: "../../../.env" });

const envConfig = {
  port: process.env.PORT || "3000",
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "banking-event-platform",
  kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/banking",
  redisUri: process.env.REDIS_URI || "redis://localhost:6379",
};

export default envConfig;
