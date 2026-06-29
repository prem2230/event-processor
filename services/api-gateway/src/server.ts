import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import Logger from "./utils/logger";

class ApiGatewayServer {
  private static readonly logger = Logger;
  private static readonly app = app;
  private static readonly envConfig = envConfig;

  public static async start(): Promise<void> {
    this.logger.info("Starting API Gateway");

    envConfig.validateProductionSecrets();
    this.listen();

    this.logger.info("API Gateway started");
  }

  private static listen(): Server {
    return this.app.listen(this.envConfig.port, () => {
      this.logger.info("API Gateway HTTP server started", {
        port: this.envConfig.port,
        livenessPath: "/health/live",
        readinessPath: "/health/ready",
      });
    });
  }

  public static handleStartupError(error: unknown): never {
    this.logger.error("API Gateway failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

void ApiGatewayServer.start().catch(ApiGatewayServer.handleStartupError);

export default ApiGatewayServer;
