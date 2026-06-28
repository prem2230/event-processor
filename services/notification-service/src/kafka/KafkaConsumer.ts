import { Kafka, type KafkaMessage } from "kafkajs";
import envConfig from "../config/env";
import type { NotificationCreatedEvent } from "../interfaces";
import SseManager from "../services/SseManagerService";
import Logger from "../utils/logger";

class KafkaConsumer {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;
  private static running = false;
  private static readonly notificationCreatedTopic =
    this.envConfig.kafkaNotificationCreatedTopic;
  private static readonly sseManager = SseManager;
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
      topic: this.notificationCreatedTopic,
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.handleMessage(topic, partition, message);
      },
    });
    this.running = true;

    this.logger.info("Kafka consumer started", {
      topic: this.notificationCreatedTopic,
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
      this.logger.warn("Ignoring Kafka message without a value", {
        topic,
        partition,
        offset: message.offset,
      });
      return;
    }

    let event: NotificationCreatedEvent;

    try {
      event = JSON.parse(message.value.toString()) as NotificationCreatedEvent;
    } catch (error) {
      this.logger.error("Failed to parse Kafka event", {
        topic,
        partition,
        offset: message.offset,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    this.logger.info("Kafka notification event received", {
      topic,
      partition,
      offset: message.offset,
      eventId: event.eventId,
      transactionId: event.data.transactionId,
    });

    const recipientConnections =
      this.sseManager.sendNotification(event);
    this.logger.info("Notification event handled", {
      eventId: event.eventId,
      transactionId: event.data.transactionId,
      recipientConnections,
    });
  }
}

export default KafkaConsumer;
