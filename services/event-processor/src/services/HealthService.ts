import MongoConnection from "../config/mongo";
import RedisService from "../config/redisClient";
import { ReadinessStatus } from "../interfaces";
import KafkaConsumer from "../kafka/KafkaConsumer";
import KafkaProducer from "../kafka/KafkaProducer";

class HealthService {
  private static readonly mongoConnection = MongoConnection;
  private static readonly redisService = RedisService;
  private static readonly kafkaConsumer = KafkaConsumer;
  private static readonly kafkaProducer = KafkaProducer;

  public static getReadiness(): ReadinessStatus {
    const checks = {
      mongo: this.mongoConnection.isReady(),
      redis: this.redisService.isReady(),
      kafkaProducer: this.kafkaProducer.isReady(),
      kafkaConsumer: this.kafkaConsumer.isReady(),
    };

    return {
      ready: Object.values(checks).every(Boolean),
      checks,
    };
  }
}

export default HealthService;
