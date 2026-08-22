import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";

class EnvConfig {
  public static readonly nodeEnv = nodeEnv;
  public static readonly logFormat = (
    process.env.LOG_FORMAT || (nodeEnv === "development" ? "pretty" : "json")
  ).toLowerCase();
  public static readonly logLevel = (
    process.env.LOG_LEVEL || "info"
  ).toLowerCase();
  public static readonly levelPriority = { error: 0, warn: 1, info: 2 };
  public static readonly port = Number(process.env.PORT) || 3000;
  public static readonly userServiceUrl =
    process.env.USER_SERVICE_URL || "http://localhost:3004";
  public static readonly accountServiceUrl =
    process.env.ACCOUNT_SERVICE_URL || "http://localhost:3005";
  public static readonly paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:3006";
  public static readonly internalServiceToken =
    process.env.INTERNAL_SERVICE_TOKEN || "local-internal-service-token";
  public static readonly jwtSecret =
    process.env.JWT_SECRET ||
    "replace-this-local-jwt-secret-with-32-characters";
  public static readonly jwtIssuer =
    process.env.JWT_ISSUER || "banking-api-gateway";
  public static readonly jwtAudience =
    process.env.JWT_AUDIENCE || "banking-platform";
  public static readonly jwtExpiresInSeconds =
    Number(process.env.JWT_EXPIRES_IN_SECONDS) || 900;
  public static readonly upstreamTimeoutMs =
    Number(process.env.UPSTREAM_TIMEOUT_MS) || 3000;

  public static validateProductionSecrets(): void {
    if (this.nodeEnv !== "production") return;
    if (
      this.jwtSecret.includes("replace-this") ||
      this.internalServiceToken === "local-internal-service-token"
    ) {
      throw new Error("Production authentication secrets are not configured");
    }
  }
}

export default EnvConfig;
