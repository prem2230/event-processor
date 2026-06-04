import dotenv from "dotenv";

dotenv.config({ path: "../../../.env" });

const envConfig = {
    port: process.env.PORT || "3002",
    kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
    kafkaClientId: process.env.KAFKA_CLIENT_ID || "notification-service",
    kafkaGroupId: process.env.KAFKA_GROUP_ID || "notification-service-group",
};

export default envConfig;