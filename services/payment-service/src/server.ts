import app from "./app";
import { config } from "./config";
import MongoConnection from "./config/mongo";
import Logger from "./utils/logger";

async function start(): Promise<void> {
  await MongoConnection.connect();
  app.listen(config.port, () => Logger.info("Payment service HTTP server started", { port: config.port }));
}
void start().catch((error: unknown) => { Logger.error("Payment service failed to start", { error: error instanceof Error ? error.message : String(error) }); process.exit(1); });
