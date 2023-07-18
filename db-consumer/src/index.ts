import { runConsumer } from "./consumer";
import { logger } from "./shared/logger";

import "./healthcheckPing"; // per healthcheck di docker compose

const run = async () => {
    logger.info("Starting RabbitMQ producer and consumer...");
    runConsumer();
};

run();
