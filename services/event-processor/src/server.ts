import MongoConnection from "./config/mongo";
import RedisService from "./config/redisClient";
import KafkaConsumer from "./kafka/KafkaConsumer";
import KafkaProducer from "./kafka/KafkaProducer";
import Logger from "./utils/logger";

class EventProcessorServer {
  private static readonly logger = Logger;
  private static readonly mongoConnection = MongoConnection;
  private static readonly redisService = RedisService;
  private static readonly kafkaProducer = KafkaProducer;
  private static readonly kafkaConsumer = KafkaConsumer;

  public static async start(): Promise<void> {
    EventProcessorServer.logger.info("Starting Event Processor");

    await EventProcessorServer.mongoConnection.connect();
    await EventProcessorServer.redisService.connect();
    await EventProcessorServer.kafkaProducer.connect();
    await EventProcessorServer.kafkaConsumer.start();

    EventProcessorServer.logger.info("Event Processor started");
  }

  public static handleStartupError(error: unknown): never {
    EventProcessorServer.logger.error("Event Processor failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

void EventProcessorServer.start().catch(
  EventProcessorServer.handleStartupError,
);

export default EventProcessorServer;
