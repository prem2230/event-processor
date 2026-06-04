import mongoose from "mongoose";
import envConfig from "../config/env";

export async function connectMongo(): Promise<void> {
    await mongoose.connect(envConfig.mongoUri);
    console.log("MongoDB connected");
}