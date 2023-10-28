import { envs } from "./config/envs";
import { logger } from "./shared/logger";

Bun.serve({
    port: envs.PING_SERVER_PORT,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/ping") return new Response("pong!");
        return new Response("404");
    }
});

logger.info(`Ping server listening on port ${envs.PING_SERVER_PORT}`);
