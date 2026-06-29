import { Kafka, Partitioners } from "kafkajs";
import envConfig from "../config/env";
import type { TransactionCreatedEvent } from "../interfaces";
import Logger from "../utils/logger";

class KafkaProducer {
  private static readonly logger = Logger;
  private static connected = false;
  private static readonly kafka = new Kafka({
    clientId: envConfig.kafkaClientId,
    brokers: [envConfig.kafkaBroker],
  });
  private static readonly producer = KafkaProducer.kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  public static async connect(): Promise<void> {
    this.logger.info("Connecting Kafka producer", {
      clientId: envConfig.kafkaClientId,
      broker: envConfig.kafkaBroker,
    });
    await this.producer.connect();
    this.connected = true;
    this.logger.info("Kafka producer connected");
  }

  public static isReady(): boolean {
    return this.connected;
  }

  public static async publishTransactionCreated(
    event: TransactionCreatedEvent,
  ): Promise<void> {
    await this.producer.send({
      topic: envConfig.kafkaTransactionCreatedTopic,
      messages: [
        {
          key: event.data.accountId,
          value: JSON.stringify(event),
        },
      ],
    });
    this.logger.info("Transaction event published", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      topic: envConfig.kafkaTransactionCreatedTopic,
    });
  }
}

export default KafkaProducer;
