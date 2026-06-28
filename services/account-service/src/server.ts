import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import MongoConnection from "./config/mongo";
import Logger from "./utils/logger";

class AccountServiceServer {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;
  private static readonly mongoConnection = MongoConnection;

  public static async start(): Promise<void> {
    this.envConfig.validateProductionSecrets();
    AccountServiceServer.listen();
    await this.mongoConnection.connect();
    this.logger.info("Account Service started");
  }
  private static listen(): Server {
    return app.listen(this.envConfig.port, () =>
      this.logger.info("Account Service HTTP server started", {
        port: this.envConfig.port,
      }),
    );
  }
  public static handleStartupError(error: unknown): never {
    this.logger.error("Account Service failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}
void AccountServiceServer.start().catch(
  AccountServiceServer.handleStartupError,
);
export default AccountServiceServer;
