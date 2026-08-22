import mongoose from "mongoose";
import { config } from "../config";
import Logger from "../utils/logger";
class MongoConnection {
  private static ready = false;
  static async connect(): Promise<void> { await mongoose.connect(config.mongoUri); this.ready = true; Logger.info("MongoDB connected"); }
  static isReady(): boolean { return this.ready; }
}
export default MongoConnection;
