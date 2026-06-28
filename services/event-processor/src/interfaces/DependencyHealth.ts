export interface DependencyHealth {
  kafkaConsumer: boolean;
  kafkaProducer: boolean;
  mongo: boolean;
  redis: boolean;
}
