import { createClient } from "redis";
import { logger } from "./shared/logger";

export const client = createClient({ url: "redis://redis:6379" });

client.on("error", err => {
    logger.error("Redis Client Error");
    logger.error(err);
});

export async function startRedis() {
    await client.connect();
    logger.info("Redis client connected");
}
