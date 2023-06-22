import { rawDataEvent } from "..";
import { config } from "../config/config";
import { kafka } from "../config/kafka";
import { Errors } from "../interfaces/Error";
import { RawDataWithType } from "../interfaces/EventEmitters";
import { RawData } from "../interfaces/RawData";
import { logger } from "../shared/logger";

const consumer = kafka.consumer({ groupId: config.KAFKA_GROUP_ID });

export const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({
        topic: config.KAFKA_CONSUMER_TOPIC,
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                if (!message.value) {
                    logger.error("Empty payload received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_EMPTY_PAYLOAD);
                }

                const [, scraperType] =
                    config.KAFKA_CONSUMER_TOPIC.exec(topic) || [];
                if (!scraperType) {
                    logger.error("Invalid topic received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_INVALID_TOPIC);
                }

                let parsed: RawData;
                try {
                    parsed = JSON.parse(message.value.toString("utf-8"));
                } catch (err) {
                    logger.error("Malformed JSON data received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_MALFORMED_JSON_DATA);
                }

                if (!(config.RAW_DATA_MESSAGE_TO_PARSE_KEY in parsed)) {
                    logger.error("Invalid raw data received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_INVALID_RAW_DATA);
                }

                logger.info(
                    `Received raw data: '${parsed}' from scraperType: ${scraperType}`
                );
                rawDataEvent.emit("rawData", {
                    scraperType,
                    rawData: parsed
                } as RawDataWithType);
            } catch (error) {
                logger.debug("An error occurred in the Kafka consumer:", error);
                throw error;
            }
        }
    });
};
