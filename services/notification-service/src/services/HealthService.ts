import { ReadinessStatus } from "../interfaces/ReadinessStatus";
import KafkaConsumer from "../kafka/KafkaConsumer";
import SseManager from "./SseManagerService";

class HealthService {
  private static readonly kafkaConsumer = KafkaConsumer;
  private static readonly sseManager = SseManager;

  public static getReadiness(): ReadinessStatus {
    const checks = {
      kafkaConsumer: this.kafkaConsumer.isReady(),
      sseManager: true,
    };

    return {
      ready: Object.values(checks).every(Boolean),
      checks,
    };
  }

  public static getConnectedClientCount(): number {
    return this.sseManager.getConnectedClientCount();
  }
}

export default HealthService;
