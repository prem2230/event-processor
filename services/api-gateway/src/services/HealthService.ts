import envConfig from "../config/env";
import KafkaService from "../kafka/KafkaService";

interface ReadinessStatus {
  checks: {
    accountService: boolean;
    kafkaProducer: boolean;
    userService: boolean;
  };
  ready: boolean;
}

class HealthService {
  public static async getReadiness(): Promise<ReadinessStatus> {
    const [userService, accountService] = await Promise.all([
      HealthService.checkUpstream(envConfig.userServiceUrl),
      HealthService.checkUpstream(envConfig.accountServiceUrl),
    ]);
    const checks = {
      kafkaProducer: KafkaService.isReady(),
      userService,
      accountService,
    };
    return { ready: Object.values(checks).every(Boolean), checks };
  }

  private static async checkUpstream(baseUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/health/ready`, {
        signal: AbortSignal.timeout(envConfig.upstreamTimeoutMs),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default HealthService;
