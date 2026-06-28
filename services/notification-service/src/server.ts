import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import KafkaConsumer from "./kafka/KafkaConsumer";
import Logger from "./utils/logger";

class NotificationServiceServer {
  private static readonly app = app;
  private static readonly kafkaConsumer = KafkaConsumer;
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;
  private static readonly port = this.envConfig.port;

  public static async start(): Promise<void> {
    this.logger.info("Starting Notification Service");

    this.listen();
    await this.kafkaConsumer.start();

    this.logger.info("Notification Service started");
  }

  private static listen(): Server {
    return this.app.listen(
      this.port,
      () => {
        this.logger.info("HTTP server started", {
          port: this.port,
          livenessPath: "/health/live",
          readinessPath: "/health/ready",
        });
      },
    );
  }

  public static handleStartupError(error: unknown): never {
    this.logger.error(
      "Notification Service failed to start",
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    process.exit(1);
  }
}

void NotificationServiceServer.start().catch(
  NotificationServiceServer.handleStartupError,
);

export default NotificationServiceServer;
