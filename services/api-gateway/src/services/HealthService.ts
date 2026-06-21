import KafkaService from "../kafka/KafkaService";

interface ReadinessStatus {
  checks: {
    kafkaProducer: boolean;
  };
  ready: boolean;
}

class HealthService {
  public static getReadiness(): ReadinessStatus {
    const checks = {
      kafkaProducer: KafkaService.isReady(),
    };

    return {
      ready: Object.values(checks).every(Boolean),
      checks,
    };
  }
}

export default HealthService;
