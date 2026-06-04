import { connectMongo } from "./config/mongo";
import { connectRedis } from "./config/redisClient";
import { startKafkaConsumer } from "./kafka/KafkaConsumer";
import { startKafkaProducer } from "./kafka/KafkaProducer";

async function startEventProcessor(): Promise<void> {
    await connectMongo();
    await connectRedis();
    await startKafkaConsumer();
    await startKafkaProducer();
}

void startEventProcessor().catch((error) => {
    console.error("Event Processor failed to start", error);
    process.exit(1);
});