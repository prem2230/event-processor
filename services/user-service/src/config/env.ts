import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class EnvConfig {
  public static readonly nodeEnv = process.env.NODE_ENV || "development";
  public static readonly logFormat = (
    process.env.LOG_FORMAT ||
    (EnvConfig.nodeEnv === "development" ? "pretty" : "json")
  ).toLowerCase();
  public static readonly logLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
  public static readonly levelPriority = { error: 0, warn: 1, info: 2 };
  public static readonly port = Number(process.env.PORT) || 3004;
  public static readonly mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/users";
  public static readonly internalServiceToken =
    process.env.INTERNAL_SERVICE_TOKEN || "local-internal-service-token";

  public static validateProductionSecrets(): void {
    if (
      EnvConfig.nodeEnv === "production" &&
      EnvConfig.internalServiceToken === "local-internal-service-token"
    ) {
      throw new Error("Production internal service token is not configured");
    }
  }
}

export default EnvConfig;
