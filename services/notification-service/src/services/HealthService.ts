import KafkaConsumer from "../kafka/KafkaConsumer";
import SseManager from "../sse/SseManager";

interface ReadinessStatus {
  checks: {
    kafkaConsumer: boolean;
    sseManager: boolean;
  };
  ready: boolean;
}

class HealthService {
  public static getReadiness(): ReadinessStatus {
    const checks = {
      kafkaConsumer: KafkaConsumer.isReady(),
      sseManager: true,
    };

    return {
      ready: Object.values(checks).every(Boolean),
      checks,
    };
  }

  public static getConnectedClientCount(): number {
    return SseManager.getConnectedClientCount();
  }
}

export default HealthService;
