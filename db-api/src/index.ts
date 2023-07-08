import express from "express";

import apiRoutes from "./routes";
import { envs } from "./config/envs";
import { logger } from "./shared/logger";
import { NOT_FOUND } from "http-status";

const app = express();

app.use("/api", apiRoutes);

app.all("*", (req, res) => res.status(NOT_FOUND).json({ err: "Not found" }));

app.listen(envs.PORT, () => {
    logger.info(`Server listening on port ${envs.PORT}`);
});
