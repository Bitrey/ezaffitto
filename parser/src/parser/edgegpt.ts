import { readFile } from "fs/promises";
import { envs } from "../config/envs";
import { spawn } from "child_process";
import path from "path";
import { logger } from "../shared/logger";
import { RentalPost } from "../interfaces/RentalPost";
import { config } from "../config/config";
import { EdgeGPTResponse } from "../interfaces/EdgeGPTResponse";
import { fetchEventSource } from "@waylaidwanderer/fetch-event-source";

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

    // private async fetchEdgeGpt(
    //     humanText: string
    // ): Promise<EdgeGPTResponse | null> {
    //     const prompt = await this.getPrompt(humanText);

    //     return new Promise((resolve, reject) => {
    //         let dataToSend = "";

    //         let python = spawn("python3", [
    //             path.join(process.cwd(), envs.PYTHON_PARSER_PATH),
    //             prompt
    //         ]);

    //         if (config.PROXYCHAIN_ON) {
    //             python = spawn("proxychains", [
    //                 "-q",
    //                 "python3",
    //                 path.join(process.cwd(), envs.PYTHON_PARSER_PATH),
    //                 prompt
    //             ]);
    //         }

    //         python.stdout.on("data", function (data) {
    //             logger.debug("\nPipe data from python script:");
    //             logger.debug(data.toString() + "\n");
    //             dataToSend = data.toString();
    //         });

    //         python.on("error", function (data) {
    //             logger.error("Error (error event) from Python parser script:");
    //             logger.error(data);
    //             return resolve(null);
    //         });

    //         python.stderr.on("data", data => {
    //             logger.error(
    //                 "Error (stderr.data event) from Python parser script:"
    //             );
    //             logger.error(data);
    //             return resolve(null);
    //         });

    //         python.on("close", code => {
    //             logger.debug(`Child process close all stdio with code ${code}`);

    //             logger.info(
    //                 `Parser script exited with code ${code} (${
    //                     code === 0 ? "SUCCESS!" : "error"
    //                 })`
    //             );

    //             try {
    //                 return resolve(JSON.parse(dataToSend) as EdgeGPTResponse);
    //             } catch (err) {
    //                 logger.error(
    //                     "Error parsing JSON from Python parser script:"
    //                 );
    //                 logger.error(err);
    //                 return resolve(null);
    //             }
    //         });
    //     });
    // }

    private findMostConsistent(rentalPosts: RentalPost[]): RentalPost | null {
        if (rentalPosts.length === 0) {
            return null;
        }

        let scores = new Array(rentalPosts.length).fill(0);

        for (let i = 0; i < rentalPosts.length; i++) {
            for (let j = 0; j < rentalPosts.length; j++) {
                if (i !== j) {
                    scores[i] += this.calculateSimilarityScore(
                        rentalPosts[i],
                        rentalPosts[j]
                    );
                }
            }
        }

        const maxIndex = scores.indexOf(Math.max(...scores));
        return rentalPosts[maxIndex];
    }

    private calculateSimilarityScore(a: RentalPost, b: RentalPost): number {
        let score = 0;

        for (const key in a) {
            if (
                key !== "description" &&
                Object.prototype.hasOwnProperty.call(a, key)
            ) {
                const aValue = a[key as keyof RentalPost];
                const bValue = b[key as keyof RentalPost];

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

    public async parse(humanText: string): Promise<any> {
        logger.info(`Parsing: ${humanText}`);

        const prompt = await this.getPrompt(humanText);

        const res = await this.callServerAPI(prompt);

        try {
            // const parsed = JSON.parse(res).response;
            const parsed = this.extractJSON<RentalPost>(res);
            if (!parsed) throw new Error("Not parsed");
            return parsed;
        } catch (err) {
            logger.error("Error parsing JSON from server response");
            logger.error(err);
            return res; // DEBUG
        }
    }

    private async callServerAPI(prompt: string): Promise<string> {
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
                            const result = JSON.parse(message.data);
                            console.log(result);
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
