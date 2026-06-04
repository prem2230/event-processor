import { Kafka } from "kafkajs";
import envConfig from "../config/env";
import { NotificationCreatedEvent } from "../interfaces";
import { sendNotification } from "../sse/SseManager";

const kafka = new Kafka({
    clientId: envConfig.kafkaClientId,
    brokers: [envConfig.kafkaBroker],
});

const consumer = kafka.consumer({
    groupId: envConfig.kafkaGroupId,
});

export async function startKafkaConsumer(): Promise<void> {
    await consumer.connect();

    await consumer.subscribe({
        topic: "notification.created",
        fromBeginning: false,
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) {
                return;
            }

            const event = JSON.parse(message.value.toString()) as NotificationCreatedEvent;

            sendNotification(event);

            console.log("Notification sent", {
                userId: event.data.userId,
                transactionId: event.data.transactionId,
            });
        },
    });

    console.log("Notification Service listening to notification.created");
}