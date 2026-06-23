import { Kafka, type KafkaMessage } from "kafkajs";
import envConfig from "../config/env";
import type { NotificationCreatedEvent } from "../interfaces";
import SseManager from "../sse/SseManager";
import Logger from "../utils/logger";

class KafkaConsumer {
  private static readonly logger = Logger;
  private static running = false;
  private static readonly notificationCreatedTopic =
    envConfig.kafkaNotificationCreatedTopic;
  private static readonly sseManager = SseManager;
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
      topic: KafkaConsumer.notificationCreatedTopic,
      fromBeginning: false,
    });
    await KafkaConsumer.consumer.run({
      eachMessage: async ({ message }) => {
        await KafkaConsumer.handleMessage(message);
      },
    });
    KafkaConsumer.running = true;

    KafkaConsumer.logger.info("Kafka consumer started", {
      topic: KafkaConsumer.notificationCreatedTopic,
      groupId: envConfig.kafkaGroupId,
    });
  }

  public static isReady(): boolean {
    return KafkaConsumer.running;
  }

  private static async handleMessage(message: KafkaMessage): Promise<void> {
    if (!message.value) {
      KafkaConsumer.logger.warn("Ignoring Kafka message without a value", {
        topic: KafkaConsumer.notificationCreatedTopic,
      });
      return;
    }

    const event = JSON.parse(
      message.value.toString(),
    ) as NotificationCreatedEvent;

    KafkaConsumer.sseManager.sendNotification(event);
    KafkaConsumer.logger.info("Notification sent", {
      userId: event.data.userId,
      transactionId: event.data.transactionId,
    });
  }
}

export default KafkaConsumer;
