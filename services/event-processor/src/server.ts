import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import MongoConnection from "./config/mongo";
import RedisService from "./config/redisClient";
import KafkaConsumer from "./kafka/KafkaConsumer";
import KafkaProducer from "./kafka/KafkaProducer";
import Logger from "./utils/logger";

class EventProcessorServer {
  private static readonly logger = Logger;
  private static readonly app = app;
  private static readonly port = envConfig.port;
  private static readonly mongoConnection = MongoConnection;
  private static readonly redisService = RedisService;
  private static readonly kafkaProducer = KafkaProducer;
  private static readonly kafkaConsumer = KafkaConsumer;

  public static async start(): Promise<void> {
    EventProcessorServer.logger.info("Starting Event Processor");

    EventProcessorServer.listen();
    await EventProcessorServer.mongoConnection.connect();
    await EventProcessorServer.redisService.connect();
    await EventProcessorServer.kafkaProducer.connect();
    await EventProcessorServer.kafkaConsumer.start();

    EventProcessorServer.logger.info("Event Processor started");
  }

  private static listen(): Server {
    return EventProcessorServer.app.listen(EventProcessorServer.port, () => {
      EventProcessorServer.logger.info("Health server started", {
        port: EventProcessorServer.port,
        livenessPath: "/health/live",
        readinessPath: "/health/ready",
      });
    });
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
