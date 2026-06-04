import { randomUUID } from "node:crypto";
import { Kafka, Partitioners } from "kafkajs";
import envConfig from "../config/env";
import { NotificationCreatedEvent } from "../interfaces";

const kafka = new Kafka({
    clientId: `${envConfig.kafkaClientId}-producer`,
    brokers: [envConfig.kafkaBroker],
});

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
});

export async function startKafkaProducer(): Promise<void> {
    await producer.connect();
    console.log("Event Processor Kafka producer connected");
}

export async function publishNotificationCreated(data: NotificationCreatedEvent["data"]): Promise<void> {
    const event: NotificationCreatedEvent = {
        eventId: randomUUID(),
        eventType: "notification.created",
        occurredAt: new Date().toISOString(),
        data,
    };

    await producer.send({
        topic: "notification.created",
        messages: [
            {
                key: data.userId,
                value: JSON.stringify(event),
            },
        ],
    });
}