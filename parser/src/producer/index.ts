import { errorsEvent, parsedDataEvent } from "..";
import { config } from "../config/config";
import { kafka } from "../config/kafka";
import { AppError } from "../interfaces/Error";
import { ParsedPost } from "../interfaces/EventEmitters";
import { logger } from "../shared/logger";

const producer = kafka.producer();

export const runProducer = async () => {
    await producer.connect();
    parsedDataEvent.on("parsedData", async data => {
        // Invia al topic Kafka
        const topic = config.KAFKA_PRODUCER_TOPIC_PREFIX + data.scraperType;
        logger.info("Sending data to Kafka on topic " + topic + "...");
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(data as ParsedPost) }]
        });
    });
    errorsEvent.on("error", async error => {
        logger.info(
            "Sending error to Kafka on topic " +
                config.KAFKA_ERROR_TOPIC +
                "..."
        );
        await producer.send({
            topic: config.KAFKA_ERROR_TOPIC,
            messages: [{ value: JSON.stringify(error as AppError) }]
        });
    });
};
