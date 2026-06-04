import { Kafka } from "kafkajs";
import envConfig from "../config/env";
import { TransactionCreatedEvent } from "../interfaces";
import { processTransaction } from "../processors/TransactionProcessor";

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
        topic: "transaction.created",
        fromBeginning: false,
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) {
                return;
            }

            const event = JSON.parse(message.value.toString()) as TransactionCreatedEvent;
            await processTransaction(event);
        },
    });

    console.log("Event Processor listening to transaction.created");
}