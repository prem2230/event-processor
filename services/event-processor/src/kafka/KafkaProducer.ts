import { randomUUID } from "node:crypto";
import { Kafka, Partitioners } from "kafkajs";
import envConfig from "../config/env";
import type { NotificationCreatedEvent } from "../interfaces";
import Logger from "../utils/logger";

class KafkaProducer {
  private static readonly logger = Logger;
  private static readonly notificationCreatedTopic =
    envConfig.kafkaNotificationCreatedTopic;
  private static readonly kafka = new Kafka({
    clientId: `${envConfig.kafkaClientId}-producer`,
    brokers: [envConfig.kafkaBroker],
  });
  private static readonly producer = KafkaProducer.kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  public static async connect(): Promise<void> {
    KafkaProducer.logger.info("Connecting Kafka producer", {
      clientId: `${envConfig.kafkaClientId}-producer`,
      broker: envConfig.kafkaBroker,
    });

    await KafkaProducer.producer.connect();

    KafkaProducer.logger.info("Kafka producer connected");
  }

  public static async publishNotificationCreated(
    data: NotificationCreatedEvent["data"],
  ): Promise<void> {
    const event = KafkaProducer.buildNotificationCreatedEvent(data);

    KafkaProducer.logger.info("Publishing notification event", {
      topic: KafkaProducer.notificationCreatedTopic,
      eventId: event.eventId,
      transactionId: data.transactionId,
      userId: data.userId,
    });

    await KafkaProducer.producer.send({
      topic: KafkaProducer.notificationCreatedTopic,
      messages: [
        {
          key: data.userId,
          value: JSON.stringify(event),
        },
      ],
    });

    KafkaProducer.logger.info("Notification event published", {
      eventId: event.eventId,
      transactionId: data.transactionId,
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
