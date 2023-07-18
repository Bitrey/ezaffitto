import { runConsumer } from "./consumer";
import { logger } from "./shared/logger";

const run = async () => {
    logger.info("Starting RabbitMQ producer and consumer...");
    runConsumer();
};

run();
