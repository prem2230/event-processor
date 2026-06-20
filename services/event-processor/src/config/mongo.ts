import mongoose from "mongoose";
import envConfig from "./env";
import Logger from "../utils/logger";

class MongoConnection {
  private static readonly logger = Logger;

  public static async connect(): Promise<void> {
    MongoConnection.logger.info("Connecting to MongoDB");
    await mongoose.connect(envConfig.mongoUri);
    MongoConnection.logger.info("MongoDB connected");
  }

  public static isReady(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default MongoConnection;
