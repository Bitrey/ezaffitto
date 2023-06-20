import express from "express";
import bodyParser from "body-parser";
import { Parser } from "./parser/edgegpt";
import { envs } from "./config/envs";
import { logger } from "./shared/logger";

const app = express();

app.use(bodyParser.json());

const parser = new Parser();

app.post("/parse", async (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ err: "Missing 'text' body parameter" });
    }
    const parsed = await parser.parse(req.body.text);

    if (parsed) {
        return res.json(parsed);
    } else {
        return res.status(500).json({ err: "Error parsing text" });
    }
});

app.listen(envs.PORT, () => {
    logger.info(`Parser server listening on port ${envs.PORT}`);
});
