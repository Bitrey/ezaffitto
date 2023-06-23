import { Kafka } from "kafkajs";
import { config } from "./config";

export const kafka = new Kafka({
    clientId: config.KAFKA_CLIENT_ID,
    brokers: config.KAFKA_BROKERS
});
