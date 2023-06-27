import { readFile } from "fs/promises";
import { envs } from "../config/envs";
import path from "path";
import { logger } from "../shared/logger";
import { config } from "../config/config";
import { fetchEventSource } from "@waylaidwanderer/fetch-event-source";
import { RentalPost } from "../interfaces/RentalPost";
import { Errors } from "../interfaces/Error";
import moment from "moment";

export class EdgeGPTParser {
    private static wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private extractJSON = <T>(input: string): T | null => {
        const match = input.match(/{[\s\S]*?}/);

        try {
            return match ? JSON.parse(match[0]) : null;
        } catch (error) {
            console.error("Errore durante il parsing del JSON:", error);
            logger.error(input);
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

    private findMostConsistent<T extends object>(arr: T[]): T | null {
        logger.debug(
            `Finding most consistent response from ${arr.length} items`
        );

        if (arr.length === 0) {
            return null;
        }

        let scores = new Array(arr.length).fill(0);

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
                if (i !== j) {
                    scores[i] += this.calculateSimilarityScore(arr[i], arr[j]);
                }
            }
        }

        const maxIndex = scores.indexOf(Math.max(...scores));
        return arr[maxIndex];
    }

    private calculateSimilarityScore<T>(a: T, b: T): number {
        let score = 0;

        for (const key in a) {
            if (
                key !== "description" &&
                Object.prototype.hasOwnProperty.call(a, key)
            ) {
                const aValue = a[key as keyof T];
                const bValue = b[key as keyof T];

                if (aValue instanceof Date && bValue instanceof Date) {
                    // Compare dates
                    if (aValue.getTime() === bValue.getTime()) {
                        score++;
                    }
                } else {
                    // Compare other properties
                    if (aValue === bValue) {
                        score++;
                    }
                }
            }
        }

        return score;
    }

    private async fetchServerResponses(prompt: string): Promise<string[]> {
        logger.debug(`Fetching ${config.NUM_TRIES} server responses`);

        // Array of Promises with error handling
        const promises = Array(config.NUM_TRIES)
            .fill(null)
            .map(() =>
                this.callServerAPI(prompt).catch(err => {
                    logger.error("Error fetching response from server");
                    logger.error(err);
                    return null;
                })
            );

        // Await all responses and filter out any null values from failed requests
        const responses = await Promise.all(promises);
        return responses.filter(response => response !== null) as string[];
    }

    private extractValidJSONs<T extends object>(responses: string[]): T[] {
        logger.debug(
            `Extracting valid JSONs from ${responses.length} server responses`
        );

        return responses
            .map(res => {
                try {
                    return this.extractJSON<T>(res);
                } catch (err) {
                    logger.error(
                        "Error parsing JSON from one of the server responses"
                    );
                    logger.error(err);
                    return null;
                }
            })
            .filter(parsed => parsed !== null) as T[];
    }

    public async parse(humanText: string): Promise<RentalPost> {
        logger.info(`Parsing: ${humanText.substring(0, 30)}...`);

        const startDate = moment();

        const prompt = await this.getPrompt(humanText);
        const responses = await this.fetchServerResponses(prompt);
        const parsed = this.extractValidJSONs<RentalPost>(responses);
        const mostConsistent = this.findMostConsistent<RentalPost>(parsed);

        if (!mostConsistent) {
            logger.error("No consistent response found");
            throw new Error(Errors.PARSER_NO_SUCCESSFUL_GPT_FETCH);
        }

        const endDate = moment();
        const duration = moment.duration(endDate.diff(startDate));

        logger.info(
            `Parsing ${humanText.substring(
                0,
                30
            )}... successful in ${duration.asSeconds()}s (${parsed.length}/${
                config.NUM_TRIES
            } successfully parsed responses)`
        );

        return mostConsistent;
    }

    private async callServerAPI(prompt: string): Promise<string> {
        logger.debug(
            `Calling server API for prompt: ${prompt.substring(0, 50)}...`
        );

        const opts = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                // Set stream to true to receive each token as it is generated.
                stream: true
            })
        };

        let reply = "";

        try {
            const controller = new AbortController();
            await fetchEventSource(
                `http://${config.GPT_HOST}:${config.GPT_PORT}/conversation`,
                {
                    ...opts,
                    signal: controller.signal,
                    onopen: async (response: any) => {
                        if (response.status !== 200) {
                            throw new Error(
                                `Failed to send message. HTTP ${response.status} - ${response.statusText}`
                            );
                        }
                    },
                    onclose: () => {
                        throw new Error(
                            "Failed to send message. Server closed the connection unexpectedly."
                        );
                    },
                    onerror: (err: Error) => {
                        throw err;
                    },
                    onmessage: (message: any) => {
                        // { data: 'Hello', event: '', id: '', retry: undefined }
                        if (message.data === "[DONE]") {
                            controller.abort();
                            return;
                        }
                        if (message.event === "result") {
                            // const result = JSON.parse(message.data);
                            // console.log(result);
                            return;
                        }
                        reply += JSON.parse(message.data);
                    }
                } as any
            );

            return reply;
        } catch (err) {
            logger.error("Error while calling server API", err);
            throw err;
        }
    }
}
