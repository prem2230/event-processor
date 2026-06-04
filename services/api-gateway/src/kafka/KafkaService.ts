import { Kafka } from "kafkajs";
import envConfig from "../config/env";

export const kafka = new Kafka({
  clientId: envConfig.kafkaClientId,
  brokers: [envConfig.kafkaBroker],
});

export const producer = kafka.producer();
