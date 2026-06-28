import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import MongoConnection from "./config/mongo";
import Logger from "./utils/logger";

class UserServiceServer {
  private static readonly logger = Logger;
  private static readonly mongoConnection = MongoConnection;
  private static readonly envConfig = envConfig;

  public static async start(): Promise<void> {
    this.envConfig.validateProductionSecrets();
    this.listen();
    await this.mongoConnection.connect();
    this.logger.info("User Service started");
  }
  private static listen(): Server {
    return app.listen(this.envConfig.port, () =>
      this.logger.info("User Service HTTP server started", { port: envConfig.port }),
    );
  }
  public static handleStartupError(error: unknown): never {
    this.logger.error("User Service failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

void UserServiceServer.start().catch(UserServiceServer.handleStartupError);
export default UserServiceServer;
