import { Kafka, type KafkaMessage } from "kafkajs";
import envConfig from "../config/env";
import type { TransactionCreatedEvent } from "../interfaces";
import TransactionProcessor from "../processors/TransactionProcessor";
import Logger from "../utils/logger";

class KafkaConsumer {
  private static readonly logger = Logger;
  private static running = false;
  private static readonly transactionCreatedTopic =
    envConfig.kafkaTransactionCreatedTopic;
  private static readonly transactionProcessor = TransactionProcessor;
  private static readonly kafka = new Kafka({
    clientId: envConfig.kafkaClientId,
    brokers: [envConfig.kafkaBroker],
  });
  private static readonly consumer = KafkaConsumer.kafka.consumer({
    groupId: envConfig.kafkaGroupId,
  });

  public static async start(): Promise<void> {
    KafkaConsumer.logger.info("Connecting Kafka consumer", {
      clientId: envConfig.kafkaClientId,
      groupId: envConfig.kafkaGroupId,
      broker: envConfig.kafkaBroker,
    });

    await KafkaConsumer.consumer.connect();
    await KafkaConsumer.consumer.subscribe({
      topic: KafkaConsumer.transactionCreatedTopic,
      fromBeginning: false,
    });
    await KafkaConsumer.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await KafkaConsumer.handleMessage(topic, partition, message);
      },
    });
    KafkaConsumer.running = true;

    KafkaConsumer.logger.info("Kafka consumer started", {
      topic: KafkaConsumer.transactionCreatedTopic,
      groupId: envConfig.kafkaGroupId,
    });
  }

  public static isReady(): boolean {
    return KafkaConsumer.running;
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
      KafkaConsumer.logger.error("Failed to parse Kafka event", {
        topic,
        partition,
        offset: message.offset,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    KafkaConsumer.logger.info("Kafka event received", {
      topic,
      partition,
      offset: message.offset,
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      eventType: event.eventType,
    });

    await KafkaConsumer.transactionProcessor.process(event);
  }
}

export default KafkaConsumer;
