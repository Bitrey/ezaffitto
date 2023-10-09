import http from "http";
import { envs } from "./config/envs";
import { logger } from "./shared/logger";

const server = http.createServer((req, res) => {
    if (req.url === "/ping" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("pong");
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Pagina non trovata");
    }
});

server.listen(envs.PING_SERVER_PORT, () => {
    logger.debug(`Ping server listening on port ${envs.PING_SERVER_PORT}`);
});
