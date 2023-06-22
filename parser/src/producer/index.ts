import { errorsEvent, parsedDataEvent } from "..";
import { config } from "../config/config";
import { kafka } from "../config/kafka";
import { AppError } from "../interfaces/Error";
import { ParsedPost } from "../interfaces/EventEmitters";
import { RentalPost } from "../interfaces/RentalPost";

const producer = kafka.producer();

export const runProducer = async () => {
    await producer.connect();
    parsedDataEvent.on("parsedData", async data => {
        // Invia al topic Kafka
        await producer.send({
            topic: config.KAFKA_PRODUCER_TOPIC_PREFIX + data.scraperType,
            messages: [{ value: JSON.stringify(data as ParsedPost) }]
        });
    });
    errorsEvent.on("error", async error => {
        await producer.send({
            topic: config.KAFKA_ERROR_TOPIC,
            messages: [{ value: JSON.stringify(error as AppError) }]
        });
    });
};
