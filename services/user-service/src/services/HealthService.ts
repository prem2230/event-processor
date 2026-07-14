import MongoConnection from "../config/mongo";

class HealthService {
  private static readonly mongoConnection = MongoConnection;

  public static getReadiness() {
    const checks = { mongo: this.mongoConnection.isReady() };
    return { ready: checks.mongo, checks };
  }
}

export default HealthService;
