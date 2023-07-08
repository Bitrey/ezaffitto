import mongoose from "mongoose";
import { logger } from "../shared/logger";
import { envs } from "./envs";

mongoose.set("strictQuery", false);

mongoose.connection.on("error", err => {
    logger.error("Error while connecting to MongoDB");
    logger.error(err);
});
mongoose.connection.on("connecting", () => {
    logger.info("Connecting to MongoDB");
});
mongoose.connection.on("connected", () => {
    logger.info("Connected to MongoDB");
});
mongoose.connection.on("reconnected", () => {
    logger.info("Reconnected to MongoDB");
});
mongoose.connection.on("disconnecting", () => {
    logger.info("Disconnecting from MongoDB");
});
mongoose.connection.on("disconnected", () => {
    logger.info("Disconnected from MongoDB");
});

(async () => {
    try {
        logger.debug("Connect to MongoDB at " + envs.MONGODB_URI);
        await mongoose.connect(envs.MONGODB_URI, {});
    } catch (err) {
        logger.error("Error while connecting to MongoDB");
        logger.error(err);
        process.exit(1);
    }
})();
