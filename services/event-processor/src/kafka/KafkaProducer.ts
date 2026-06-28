import { randomUUID } from "node:crypto";
import { Kafka, Partitioners } from "kafkajs";
import envConfig from "../config/env";
import type { NotificationCreatedEvent } from "../interfaces";
import Logger from "../utils/logger";

class KafkaProducer {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;
  private static connected = false;
  private static readonly notificationCreatedTopic =
    this.envConfig.kafkaNotificationCreatedTopic;
  private static readonly kafka = new Kafka({
    clientId: `${this.envConfig.kafkaClientId}-producer`,
    brokers: [this.envConfig.kafkaBroker],
  });
  private static readonly producer = this.kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  public static async connect(): Promise<void> {
    this.logger.info("Connecting Kafka producer", {
      clientId: `${this.envConfig.kafkaClientId}-producer`,
      broker: this.envConfig.kafkaBroker,
    });

    await this.producer.connect();
    this.connected = true;

    this.logger.info("Kafka producer connected");
  }

  public static isReady(): boolean {
    return this.connected;
  }

  public static async publishNotificationCreated(
    data: NotificationCreatedEvent["data"],
  ): Promise<void> {
    const startedAt = Date.now();
    const event = this.buildNotificationCreatedEvent(data);

    this.logger.info("Publishing notification event", {
      topic: this.notificationCreatedTopic,
      eventId: event.eventId,
      transactionId: data.transactionId,
    });

    await this.producer.send({
      topic: this.notificationCreatedTopic,
      messages: [
        {
          key: data.userId,
          value: JSON.stringify(event),
        },
      ],
    });

    this.logger.info("Notification event published", {
      eventId: event.eventId,
      transactionId: data.transactionId,
      topic: this.notificationCreatedTopic,
      durationMs: Date.now() - startedAt,
    });
  }

  private static buildNotificationCreatedEvent(
    data: NotificationCreatedEvent["data"],
  ): NotificationCreatedEvent {
    return {
      eventId: randomUUID(),
      eventType: "notification.created",
      occurredAt: new Date().toISOString(),
      data,
    };
  }
}

export default KafkaProducer;
