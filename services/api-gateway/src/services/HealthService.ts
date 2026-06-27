import envConfig from "../config/env";
import { ReadinessStatus } from "../interfaces";
import KafkaService from "../kafka/KafkaService";

class HealthService {
  private static readonly envConfig = envConfig;
  private static readonly kafkaService = KafkaService;

  public static async getReadiness(): Promise<ReadinessStatus> {
    const [userService, accountService] = await Promise.all([
      this.checkUpstream(this.envConfig.userServiceUrl),
      this.checkUpstream(this.envConfig.accountServiceUrl),
    ]);
    const checks = {
      kafkaProducer: this.kafkaService.isReady(),
      userService,
      accountService,
    };
    return { ready: Object.values(checks).every(Boolean), checks };
  }

  private static async checkUpstream(baseUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/health/ready`, {
        signal: AbortSignal.timeout(this.envConfig.upstreamTimeoutMs),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default HealthService;
