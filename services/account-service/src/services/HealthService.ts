import MongoConnection from "../config/mongo";

class HealthService {
  public static getReadiness() {
    const checks = { mongo: MongoConnection.isReady() };
    return { ready: checks.mongo, checks };
  }
}
export default HealthService;
