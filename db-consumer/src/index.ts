import { runConsumer } from "./consumer";
import { logger } from "./shared/logger";

import "./healthcheckPing"; // per healthcheck di docker compose
import { config } from "./config";
import axios from "axios";

export const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

const run = async () => {
    logger.info("Starting RabbitMQ producer and consumer...");
    runConsumer();
};

run();
