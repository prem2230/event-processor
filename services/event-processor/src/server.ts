import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import MongoConnection from "./config/mongo";
import KafkaConsumer from "./kafka/KafkaConsumer";
import KafkaProducer from "./kafka/KafkaProducer";
import Logger from "./utils/logger";

class EventProcessorServer {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;
  private static readonly app = app;
  private static readonly port = this.envConfig.port;
  private static readonly mongoConnection = MongoConnection;
  private static readonly kafkaProducer = KafkaProducer;
  private static readonly kafkaConsumer = KafkaConsumer;

  public static async start(): Promise<void> {
    this.logger.info("Starting Event Processor");

    this.listen();
    await this.mongoConnection.connect();
    await this.kafkaProducer.connect();
    await this.kafkaConsumer.start();

    this.logger.info("Event Processor started");
  }

  private static listen(): Server {
    return this.app.listen(this.port, () => {
      this.logger.info("Health server started", {
        port: this.port,
        livenessPath: "/health/live",
        readinessPath: "/health/ready",
      });
    });
  }

  public static handleStartupError(error: unknown): never {
    this.logger.error("Event Processor failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

void EventProcessorServer.start().catch(
  EventProcessorServer.handleStartupError,
);

export default EventProcessorServer;
