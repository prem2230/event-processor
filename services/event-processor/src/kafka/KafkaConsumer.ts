import { Kafka, type KafkaMessage } from "kafkajs";
import envConfig from "../config/env";
import type { TransactionCreatedEvent } from "../interfaces";
import TransactionProcessor from "../processors/TransactionProcessor";
import Logger from "../utils/logger";

class KafkaConsumer {
  private static readonly logger = Logger;
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
      eachMessage: async ({ message }) => {
        await KafkaConsumer.handleMessage(message);
      },
    });

    KafkaConsumer.logger.info("Kafka consumer started", {
      topic: KafkaConsumer.transactionCreatedTopic,
      groupId: envConfig.kafkaGroupId,
    });
  }

  private static async handleMessage(message: KafkaMessage): Promise<void> {
    if (!message.value) {
      KafkaConsumer.logger.warn("Ignoring Kafka message without a value", {
        topic: KafkaConsumer.transactionCreatedTopic,
      });
      return;
    }

    const event = JSON.parse(
      message.value.toString(),
    ) as TransactionCreatedEvent;
    await KafkaConsumer.transactionProcessor.process(event);
  }
}

export default KafkaConsumer;
