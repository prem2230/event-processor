import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import KafkaConsumer from "./kafka/KafkaConsumer";
import Logger from "./utils/logger";

class NotificationServiceServer {
  private static readonly app = app;
  private static readonly kafkaConsumer = KafkaConsumer;
  private static readonly logger = Logger;
  private static readonly port = envConfig.port;

  public static async start(): Promise<void> {
    NotificationServiceServer.logger.info("Starting Notification Service");

    NotificationServiceServer.listen();
    await NotificationServiceServer.kafkaConsumer.start();

    NotificationServiceServer.logger.info("Notification Service started");
  }

  private static listen(): Server {
    return NotificationServiceServer.app.listen(
      NotificationServiceServer.port,
      () => {
        NotificationServiceServer.logger.info("HTTP server started", {
          port: NotificationServiceServer.port,
          livenessPath: "/health/live",
          readinessPath: "/health/ready",
        });
      },
    );
  }

  public static handleStartupError(error: unknown): never {
    NotificationServiceServer.logger.error(
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
