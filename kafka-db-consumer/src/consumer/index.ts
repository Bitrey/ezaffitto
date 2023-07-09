import { Errors } from "../interfaces/Error";
import { config } from "../config";
import { kafka } from "../config/kafka";
import { kafkaMessageIsNotEmpty } from "../shared/kafkaMessageIsNotEmpty";
import { logger } from "../shared/logger";
import { rawDataHandler } from "./rawHandler";
import { parsedDataHandler } from "./parsedHandler";

const consumer = kafka.consumer({
    allowAutoTopicCreation: true,
    groupId: config.KAFKA_GROUP_ID,
    metadataMaxAge: config.METADATA_MAX_AGE
});

export const runConsumer = async () => {
    await consumer.connect();

    const topicToSubscribe = [
        config.KAFKA_RAW_TOPIC,
        config.KAFKA_PARSED_TOPIC
    ];

    await consumer.subscribe({
        topics: topicToSubscribe,
        fromBeginning: config.KAFKA_FROM_BEGINNING
    });

    logger.info(
        "Kafka consumer listening on topics " +
            topicToSubscribe.join(", ") +
            "..."
    );

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                if (!kafkaMessageIsNotEmpty(message)) {
                    logger.error("Empty payload received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_EMPTY_PAYLOAD);
                }

                let dbObj;

                if (config.KAFKA_RAW_TOPIC.test(topic)) {
                    dbObj = await rawDataHandler(
                        topic.replace(config.KAFKA_RAW_TOPIC_PREFIX, ""),
                        message
                    );
                } else if (config.KAFKA_PARSED_TOPIC.test(topic)) {
                    dbObj = await parsedDataHandler(
                        topic.replace(config.KAFKA_RAW_TOPIC_PREFIX, ""),
                        message
                    );
                } else {
                    logger.error(
                        `Topic ${topic} does not match the expected patterns.`
                    );
                    throw new Error(Errors.KAFKA_RECEIVED_INVALID_TOPIC);
                }
            } catch (error) {
                logger.error("An error occurred in the Kafka consumer:", error);
                throw error;
            }
        }
    });
};
