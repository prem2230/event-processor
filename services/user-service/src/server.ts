import type { Server } from "node:http";
import app from "./app";
import envConfig from "./config/env";
import MongoConnection from "./config/mongo";
import Logger from "./utils/logger";

class UserServiceServer {
  public static async start(): Promise<void> {
    envConfig.validateProductionSecrets();
    UserServiceServer.listen();
    await MongoConnection.connect();
    Logger.info("User Service started");
  }
  private static listen(): Server {
    return app.listen(envConfig.port, () =>
      Logger.info("User Service HTTP server started", { port: envConfig.port }),
    );
  }
  public static handleStartupError(error: unknown): never {
    Logger.error("User Service failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

void UserServiceServer.start().catch(UserServiceServer.handleStartupError);
export default UserServiceServer;
