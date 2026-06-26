import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import KafkaService from "./kafka/KafkaService";
import Logger from "./utils/logger";

class ApiGatewayServer {
  private static readonly logger = Logger;
  private static readonly app = app;
  private static readonly port = envConfig.port;
  private static readonly kafkaService = KafkaService;

  public static async start(): Promise<void> {
    ApiGatewayServer.logger.info("Starting API Gateway");

    envConfig.validateProductionSecrets();
    ApiGatewayServer.listen();
    await ApiGatewayServer.kafkaService.connect();

    ApiGatewayServer.logger.info("API Gateway started");
  }

  private static listen(): Server {
    return ApiGatewayServer.app.listen(ApiGatewayServer.port, () => {
      ApiGatewayServer.logger.info("API Gateway HTTP server started", {
        port: ApiGatewayServer.port,
        livenessPath: "/health/live",
        readinessPath: "/health/ready",
      });
    });
  }

  public static handleStartupError(error: unknown): never {
    ApiGatewayServer.logger.error("API Gateway failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

void ApiGatewayServer.start().catch(ApiGatewayServer.handleStartupError);

export default ApiGatewayServer;
