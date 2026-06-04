import dotenv from "dotenv";

dotenv.config({ path: "../../../.env" });

const envConfig = {
    kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
    kafkaClientId: process.env.KAFKA_CLIENT_ID || "event-processor",
    kafkaGroupId: process.env.KAFKA_GROUP_ID || "transaction-processors",
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/event_processor",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

export default envConfig;