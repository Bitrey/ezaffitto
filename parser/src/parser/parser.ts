import { readFile } from "fs/promises";
import path from "path";
import moment from "moment";
import { envs } from "../config/envs";
import { logger } from "../shared/logger";
import { config } from "../config/config";
import { RentalPost } from "../interfaces/RentalPost";
import { Errors } from "../interfaces/Error";
import { ChatCompletionResponse } from "../interfaces/ChatCompletionResponse";
import axios, { AxiosError } from "axios";
import { spawn } from "child_process";

logger.info("GPT_PROXY_URL set to: " + envs.GPT_PROXY_URL);

class Parser {
    private static wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private extractJSON = <T>(input: string): T => {
        const match = input.match(/{[\s\S]*?}/);

        if (!match) throw new Error(Errors.PARSER_JSON_EXTRACTION_FAILED);

        return JSON.parse(match[0]);
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

    private async fetchMultipleServerResponses(
        prompt: string,
        apiFunction: (input: string) => Promise<any>
    ): Promise<string[]> {
        logger.debug(`Fetching ${config.NUM_TRIES} server responses`);

        // Array of Promises with error handling
        const promises = Array(config.NUM_TRIES)
            .fill(null)
            .map(() =>
                apiFunction(prompt).catch(err => {
                    logger.error(
                        "Error fetching response",
                        err?.response?.data || err
                    );
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
        const responses = await this.fetchMultipleServerResponses(prompt, () =>
            this.spawnPythonGpt(prompt)
        );
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

    private async fetchGpt(prompt: string): Promise<string> {
        const proxyUrl = new URL(envs.GPT_PROXY_URL);

        try {
            const res = (
                await axios.post(
                    config.GPT_REVERSE_PROXY_URL,
                    {
                        messages: [
                            {
                                role: "system",
                                content: config.GPT_ROLE
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        model: "gpt-3.5-turbo",
                        temperature: 1,
                        presence_penalty: 0,
                        top_p: 1,
                        frequency_penalty: 0,
                        stream: false
                    },
                    {
                        headers: {
                            authority: "free.churchless.tech",
                            accept: "*/*",
                            "accept-language":
                                "en-GB,en;q=0.9,it-IT;q=0.8,it;q=0.7,en-US;q=0.6",
                            "content-type": "application/json",
                            origin: "https://bettergpt.chat",
                            referer: "https://bettergpt.chat/",
                            "sec-ch-ua":
                                '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": '"Linux"',
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "cross-site",
                            "user-agent":
                                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                        },
                        proxy: config.DEBUG_USE_PROXY && {
                            host: proxyUrl.hostname,
                            port: parseInt(proxyUrl.port),
                            protocol: proxyUrl.protocol
                        }
                    }
                )
            ).data as ChatCompletionResponse;

            return res.choices[0].message.content;
        } catch (err) {
            logger.error("Error fetching GPT response", err);
            logger.error((err as AxiosError)?.response?.data || err);
            throw new Error(Errors.PARSER_GPT_ERROR);
        }
    }

    private async spawnPythonGpt(prompt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const process = spawn("python3", [
                config.EDGEGPT_FILE_PATH,
                prompt
            ]);
            logger.info(`#${process.pid} process spawned`);

            let response = "";

            process.stdout.on("data", data => {
                response += data;
            });

            process.stderr.on("data", data => {
                logger.error(`#${process.pid} stderr: ${data}`);
                return reject(data);
            });

            process.on("close", code => {
                if (code === 0) {
                    resolve(response);
                } else {
                    reject(code);
                }
            });
        });
    }
}

export default Parser;
