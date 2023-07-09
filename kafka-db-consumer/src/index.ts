// DEVE essere primo senno' circular dependency => esplode
import "./config/kafka";

import { runConsumer } from "./consumer";
import { logger } from "./shared/logger";

const run = async () => {
    logger.info("Starting Kafka producer and consumer...");
    runConsumer();
};

run();
