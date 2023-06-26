import { rawDataEvent } from "..";
import { config } from "../config/config";
import { kafka } from "../config/kafka";
import { Errors } from "../interfaces/Error";
import { RawDataWithType } from "../interfaces/EventEmitters";
import { RawData } from "../interfaces/RawData";
import { logger } from "../shared/logger";

const consumer = kafka.consumer({
    allowAutoTopicCreation: true,
    groupId: config.KAFKA_GROUP_ID,
    metadataMaxAge: config.METADATA_MAX_AGE
});

export const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({
        topics: [config.KAFKA_CONSUMER_TOPIC],
        fromBeginning: config.KAFKA_FROM_BEGINNING
    });

    logger.info(
        "Kafka consumer listening on topic " +
            config.KAFKA_CONSUMER_TOPIC +
            "..."
    );

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                let scraperType: string;

                if (config.KAFKA_CONSUMER_TOPIC.test(topic)) {
                    scraperType = topic.replace("scraper.scraped.", "");
                } else {
                    logger.error(
                        `Topic ${topic} does not match the expected pattern ${config.KAFKA_CONSUMER_TOPIC}.`
                    );
                    throw new Error(Errors.KAFKA_RECEIVED_INVALID_TOPIC);
                }

                if (!message.value) {
                    logger.error("Empty payload received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_EMPTY_PAYLOAD);
                }

                logger.info(`Received message from "${scraperType}" scraper`);

                if (!scraperType) {
                    logger.error(
                        `Invalid topic received from Kafka: ${topic}.`
                    );
                    throw new Error(Errors.KAFKA_RECEIVED_INVALID_TOPIC);
                }

                let parsed: RawData;
                try {
                    parsed = JSON.parse(message.value.toString("utf-8"));
                } catch (err) {
                    logger.error(
                        `Malformed JSON data received from Kafka: ${message.value}.`
                    );
                    throw new Error(Errors.KAFKA_RECEIVED_MALFORMED_JSON_DATA);
                }

                if (
                    !(config.RAW_DATA_MESSAGE_TO_PARSE_KEY in parsed) ||
                    typeof parsed[config.RAW_DATA_MESSAGE_TO_PARSE_KEY] !==
                        "string"
                ) {
                    logger.error(
                        `Invalid raw data received from Kafka (missing ${
                            config.RAW_DATA_MESSAGE_TO_PARSE_KEY
                        }): ${JSON.stringify(parsed)}.`
                    );
                    throw new Error(Errors.KAFKA_RECEIVED_INVALID_RAW_DATA);
                }

                logger.info(
                    `Data from "${scraperType}" scraper JSONified successfully`
                );

                rawDataEvent.emit("rawData", {
                    scraperType,
                    rawData: parsed
                } as RawDataWithType);
            } catch (error) {
                logger.error("An error occurred in the Kafka consumer:", error);
                throw error;
            }
        }
    });
};
