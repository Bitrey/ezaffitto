import express from "express";

import apiRoutes from "./routes";
import { envs } from "./config/envs";
import { LoggerStream, logger } from "./shared/logger";
import { NOT_FOUND } from "http-status";
import morgan from "morgan";

const app = express();

app.use(morgan("dev", { stream: new LoggerStream() }));

app.use("/api/v1", apiRoutes);

app.all("*", (req, res) => res.status(NOT_FOUND).json({ err: "Not found" }));

app.listen(envs.PORT, () => {
    logger.info(`Server listening on port ${envs.PORT}`);
});
