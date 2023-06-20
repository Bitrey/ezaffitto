import { readFile } from "fs/promises";
import { envs } from "../config/envs";
import { spawn } from "child_process";
import path from "path";
import { logger } from "../shared/logger";
import { RentalPost } from "../interfaces/RentalPost";
import { config } from "../config/config";

interface ParsedResponse {
    text: string;
    parsed?: Partial<RentalPost>;
}

interface EdgeGPTResponse {
    text: string;
    author: string;
    sources: { [key: string]: any }[];
    sources_text: string;
    suggestions: string[];
    messages_left: number;
}

export class Parser {
    private extractJSON = (input: string): RentalPost | null => {
        const match = input.match(/{[\s\S]*?}/);

        try {
            return match ? JSON.parse(match[0]) : null;
        } catch (error) {
            console.error("Errore durante il parsing del JSON:", error);
            return null;
        }
    };

    private async getPrompt(humanText: string): Promise<string> {
        const basePrompt = await readFile(
            path.join(process.cwd(), envs.PROMPT_PATH),
            "utf-8"
        );
        return basePrompt.replace("{0}", humanText);
    }

    private async fetchEdgeGpt(
        humanText: string
    ): Promise<EdgeGPTResponse | null> {
        const prompt = await this.getPrompt(humanText);

        return new Promise((resolve, reject) => {
            let dataToSend = "";

            const python = spawn("python3", [
                path.join(process.cwd(), envs.PYTHON_PARSER_PATH),
                prompt
            ]);

            python.stdout.on("data", function (data) {
                logger.debug("\nPipe data from python script:");
                logger.debug(data.toString() + "\n");
                dataToSend = data.toString();
            });

            python.on("error", function (data) {
                logger.error("Error (error event) from Python parser script:");
                logger.error(data);
                reject(data);
            });

            python.stderr.on("data", data => {
                logger.error(
                    "Error (stderr.data event) from Python parser script:"
                );
                logger.error(data);
                reject(data);
            });

            python.on("close", code => {
                logger.debug(`Child process close all stdio with code ${code}`);

                try {
                    return resolve(JSON.parse(dataToSend) as EdgeGPTResponse);
                } catch (err) {
                    logger.error(
                        "Error parsing JSON from Python parser script:"
                    );
                    logger.error(err);
                    reject(err);
                }
            });
        });
    }

    public async parse(humanText: string): Promise<RentalPost | null> {
        logger.info(`Parsing: ${humanText}`);
        try {
            const fetchPromises: Promise<EdgeGPTResponse | null>[] = [];

            for (let i = 0; i < config.NUM_RETRIES; i++) {
                fetchPromises.push(this.fetchEdgeGpt(humanText));
            }

            const fetchedResults = await Promise.all(fetchPromises);

            logger.debug("Fetched from EdgeGPT:");
            logger.debug(JSON.stringify(fetchedResults, null, 4));

            const successfullyFetched = fetchedResults.filter(
                e => e !== null && typeof e?.text === "string"
            ) as EdgeGPTResponse[];

            if (successfullyFetched.length === 0) {
                logger.error("No successful fetches");
                return null;
            }

            const cleanedArr = successfullyFetched
                .map(e => this.extractJSON(e?.text as string))
                .filter(e => e !== null) as RentalPost[];

            if (cleanedArr.length === 0) {
                logger.error("JSON parsed array is empty");
                return null;
            }

            const cleaned = cleanedArr[0];

            return cleaned;
        } catch (err) {
            logger.error(`Error parsing: ${humanText}`);
            logger.error(err);
            return null;
        }
    }
}
