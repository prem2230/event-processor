import mongoose from "mongoose";
import envConfig from "./env";
import Logger from "../utils/logger";

class MongoConnection {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;

  public static async connect(): Promise<void> {
    this.logger.info("Connecting to MongoDB");
    await mongoose.connect(this.envConfig.mongoUri);
    this.logger.info("MongoDB connected");
  }

  public static isReady(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default MongoConnection;
