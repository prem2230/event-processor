import { Kafka } from "kafkajs";
import envConfig from "../config/env";
import type { TransactionCreatedEvent } from "../interfaces";
import Logger from "../utils/logger";

class KafkaService {
  private static readonly logger = Logger;
  private static connected = false;
  private static readonly kafka = new Kafka({
    clientId: envConfig.kafkaClientId,
    brokers: [envConfig.kafkaBroker],
  });
  private static readonly producer = KafkaService.kafka.producer();

  public static async connect(): Promise<void> {
    KafkaService.logger.info("Connecting Kafka producer", {
      clientId: envConfig.kafkaClientId,
      broker: envConfig.kafkaBroker,
    });

    await KafkaService.producer.connect();
    KafkaService.connected = true;

    KafkaService.logger.info("Kafka producer connected", {
      clientId: envConfig.kafkaClientId,
    });
  }

  public static isReady(): boolean {
    return KafkaService.connected;
  }

  public static async publishTransactionCreated(
    event: TransactionCreatedEvent,
  ): Promise<void> {
    await KafkaService.producer.send({
      topic: envConfig.kafkaTransactionCreatedTopic,
      messages: [
        {
          key: event.data.accountId,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}

export default KafkaService;
