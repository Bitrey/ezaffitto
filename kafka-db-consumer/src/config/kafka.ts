import { Kafka } from "kafkajs";
import { config } from ".";

export const kafka = new Kafka({
    clientId: config.KAFKA_CLIENT_ID,
    brokers: config.KAFKA_BROKERS
});
