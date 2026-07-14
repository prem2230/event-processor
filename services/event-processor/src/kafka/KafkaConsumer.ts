import { Kafka, type KafkaMessage } from "kafkajs";
import envConfig from "../config/env";
import TransactionProcessor from "../services/TransactionProcessorService";
import type { TransactionCreatedEvent } from "../interfaces/TransactionCreatedEvent";
import Logger from "../utils/logger";

class KafkaConsumer {
  private static readonly logger = Logger;
  private static running = false;
  private static readonly envConfig = envConfig;
  private static readonly transactionCreatedTopic =
    this.envConfig.kafkaTransactionCreatedTopic;
  private static readonly transactionProcessor = TransactionProcessor;
  private static readonly kafka = new Kafka({
    clientId: this.envConfig.kafkaClientId,
    brokers: [this.envConfig.kafkaBroker],
  });
  private static readonly consumer = KafkaConsumer.kafka.consumer({
    groupId: this.envConfig.kafkaGroupId,
  });

  public static async start(): Promise<void> {
    this.logger.info("Connecting Kafka consumer", {
      clientId: this.envConfig.kafkaClientId,
      groupId: this.envConfig.kafkaGroupId,
      broker: this.envConfig.kafkaBroker,
    });

    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.transactionCreatedTopic,
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.handleMessage(topic, partition, message);
      },
    });
    KafkaConsumer.running = true;

    this.logger.info("Kafka consumer started", {
      topic: this.transactionCreatedTopic,
      groupId: this.envConfig.kafkaGroupId,
    });
  }

  public static isReady(): boolean {
    return this.running;
  }

  private static async handleMessage(
    topic: string,
    partition: number,
    message: KafkaMessage,
  ): Promise<void> {
    if (!message.value) {
      KafkaConsumer.logger.warn("Ignoring Kafka message without a value", {
        topic,
        partition,
        offset: message.offset,
      });
      return;
    }

    let event: TransactionCreatedEvent;

    try {
      event = JSON.parse(message.value.toString()) as TransactionCreatedEvent;
    } catch (error) {
      this.logger.error("Failed to parse Kafka event", {
        topic,
        partition,
        offset: message.offset,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    this.logger.info("Kafka event received", {
      topic,
      partition,
      offset: message.offset,
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      eventType: event.eventType,
    });

    await this.transactionProcessor.process(event);
  }
}

export default KafkaConsumer;
