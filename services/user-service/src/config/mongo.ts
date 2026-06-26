import mongoose from "mongoose";
import envConfig from "./env";
import Logger from "../utils/logger";

class MongoConnection {
  public static async connect(): Promise<void> {
    Logger.info("Connecting to MongoDB");
    await mongoose.connect(envConfig.mongoUri);
    Logger.info("MongoDB connected");
  }

  public static isReady(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default MongoConnection;
