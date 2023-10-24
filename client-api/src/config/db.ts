import { MongoClient, Db } from "mongodb";
import { logger } from "../shared/logger";
import { envs } from "./envs";

async function connectToMongoDB(): Promise<Db> {
    try {
        const client = await MongoClient.connect(envs.MONGODB_URI);

        const db = client.db();
        logger.info("Connected to MongoDB");
        return db;
    } catch (err) {
        logger.error("Error while connecting to MongoDB");
        logger.error(err);
        throw err;
    }
}

export const db = connectToMongoDB();
