import MongoConnection from "../config/mongo";
import RedisService from "../config/redisClient";
import KafkaConsumer from "../kafka/KafkaConsumer";
import KafkaProducer from "../kafka/KafkaProducer";

interface DependencyHealth {
  kafkaConsumer: boolean;
  kafkaProducer: boolean;
  mongo: boolean;
  redis: boolean;
}

interface ReadinessStatus {
  checks: DependencyHealth;
  ready: boolean;
}

class HealthService {
  public static getReadiness(): ReadinessStatus {
    const checks = {
      mongo: MongoConnection.isReady(),
      redis: RedisService.isReady(),
      kafkaProducer: KafkaProducer.isReady(),
      kafkaConsumer: KafkaConsumer.isReady(),
    };

    return {
      ready: Object.values(checks).every(Boolean),
      checks,
    };
  }
}

export default HealthService;
