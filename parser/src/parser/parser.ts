import { readFile } from "fs/promises";
import path from "path";
import moment from "moment";
import { AxiosError } from "axios";
import { Configuration, OpenAIApi } from "openai";
import Joi from "joi";
import { encoding_for_model } from "@dqbd/tiktoken";
import { envs } from "../config/envs";
import { logger } from "../shared/logger";
import { config } from "../config/config";
import {
    RentalPost,
    RentalPostWithoutDescription
} from "../interfaces/RentalPost";
import { Errors } from "../interfaces/Error";
import { ChatCompletionResponse } from "../interfaces/ChatCompletionResponse";
import Queue from "promise-queue";

const configuration = new Configuration({
    organization: config.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

class Parser {
    private queue: Queue;

    constructor() {
        logger.info("Parser initialized");
        logger.info(`Using GPT model: ${config.GPT_MODEL}`);
        this.getPrompt("{0}").then(prompt => {
            logger.info("Prompt:");
            logger.info(prompt);
        });
        logger.debug(
            `Secret is ${envs.OPENAI_API_KEY.slice(
                0,
                3
            )}...${envs.OPENAI_API_KEY.slice(-5)}`
        );

        this.queue = new Queue(config.MAX_CONCURRENT_PARSES, Infinity);
    }

    private getTokenNumber(prompt: string): number {
        const enc = encoding_for_model("gpt-3.5-turbo");
        const n = enc.encode(prompt).length;
        enc.free();
        return n;
    }

    private extractJSON = <T>(input: string): T => {
        const match = input.match(/{[\s\S]*?}/);

        if (!match) throw new Error(Errors.PARSER_JSON_EXTRACTION_FAILED);

        return JSON.parse(match[0]);
    };

    private async getPrompt(humanText?: string): Promise<string> {
        const basePrompt = await readFile(
            path.join(process.cwd(), envs.MAIN_PROMPT_PATH),
            "utf-8"
        );
        const replaced = basePrompt.replace("{0}", new Date().toISOString());
        return humanText ? replaced.replace("{1}", humanText) : replaced;
    }

    private async getDescriptionPrompt(humanText: string): Promise<string> {
        const basePrompt = await readFile(
            path.join(process.cwd(), envs.DESCRIPTION_PROMPT_PATH),
            "utf-8"
        );
        return basePrompt.replace("{0}", humanText);
    }

    private findMostConsistent<T extends object>(
        arr: T[],
        importantFields: keyof T
    ): T | null {
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
                    scores[i] += this.calculateSimilarityScore(
                        arr[i],
                        arr[j],
                        importantFields
                    );
                }
            }
        }

        const maxIndex = scores.indexOf(Math.max(...scores));
        return arr[maxIndex];
    }

    private calculateSimilarityScore<T>(
        a: T,
        b: T,
        importantFields: keyof T
    ): number {
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
                        score += key === importantFields ? 5 : 1;
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

    private extractValidJSONs<T extends object>(
        responses: string[],
        schema?: Joi.ObjectSchema
    ): T[] {
        logger.debug(
            `Extracting valid JSONs from ${responses.length} server responses`
        );

        return responses
            .map(res => {
                try {
                    const j = this.extractJSON<T>(res);
                    if (schema) {
                        // Controlla che sia aderente allo schema
                        const { error, value } = schema.validate(j);
                        if (error) {
                            logger.error(
                                "Error in Joi validation for extracted JSON:",
                                j
                            );
                            logger.error(error);
                            return null;
                        }
                        return value;
                    }
                    return j;
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

    private cleanEmptyStrings<T extends object>(_objs: T[]): T[] {
        const objs = [];

        for (const obj of _objs) {
            const newObj = {} as T;

            for (const key in obj) {
                if (
                    Object.prototype.hasOwnProperty.call(obj, key) &&
                    obj[key as keyof T] !== ""
                ) {
                    newObj[key as keyof T] = obj[key as keyof T];
                }
            }

            objs.push(newObj);
        }

        return objs;
    }

    private async fetchGpt(prompt: string): Promise<string> {
        try {
            const res = (
                await openai.createChatCompletion({
                    model: config.GPT_MODEL,
                    messages: [
                        { role: "system", content: config.GPT_ROLE },
                        { role: "user", content: prompt }
                    ]
                })
            ).data as ChatCompletionResponse;

            return res.choices[0].message.content;
        } catch (err) {
            logger.error("Error fetching GPT response", err);
            logger.error((err as AxiosError)?.response?.data || err);
            throw new Error(Errors.PARSER_GPT_ERROR);
        }
    }

    public async parse(humanText: string): Promise<RentalPost> {
        logger.info(`Pushed to queue: ${humanText.substring(0, 30)}...`);

        return this.queue.add(async () => {
            logger.info(`Parsing: ${humanText.substring(0, 30)}...`);

            const startDate = moment();

            const prompt = await this.getPrompt(humanText);

            const reqTokens = this.getTokenNumber(prompt);
            if (reqTokens > config.MAX_GPT_TOKENS) {
                logger.error(
                    `Input text is too long (${reqTokens} tokens, max ${config.MAX_GPT_TOKENS})`
                );
                throw new Error(Errors.GPT_TOKENS_EXCEEDED);
            }

            logger.debug(
                `Prompt length: ${reqTokens}/${config.MAX_GPT_TOKENS} tokens`
            );

            const responses = await this.fetchMultipleServerResponses(
                prompt,
                () => this.fetchGpt(prompt)
            );
            const parsed =
                this.extractValidJSONs<RentalPostWithoutDescription>(responses);
            const cleaned =
                this.cleanEmptyStrings<RentalPostWithoutDescription>(parsed);
            const nonRental = cleaned.find(e => !e.isForRent || !e.isRental);
            const mostConsistent =
                nonRental ||
                this.findMostConsistent<RentalPostWithoutDescription>(
                    cleaned,
                    "monthlyPrice"
                ); // enfasi sul prezzo

            if (!mostConsistent) {
                logger.error("No consistent response found");
                throw new Error(Errors.PARSER_NO_SUCCESSFUL_GPT_FETCH);
            }

            const resTokens = this.getTokenNumber(
                JSON.stringify(mostConsistent)
            );
            logger.debug(
                `Response length: ${resTokens}/${config.MAX_GPT_TOKENS} tokens`
            );

            let description = humanText;
            let descriptionTokens = 0;
            if (config.REPROCESS_POST_TEXT) {
                logger.info(
                    `Fetching description for: ${humanText.substring(0, 30)}...`
                );
                const descriptionPrompt = await this.getDescriptionPrompt(
                    humanText
                );
                descriptionTokens = this.getTokenNumber(descriptionPrompt);
                description = await this.fetchGpt(descriptionPrompt);
            }

            const obj: RentalPost = { description, ...mostConsistent };

            const endDate = moment();
            const duration = moment.duration(endDate.diff(startDate));

            logger.info(
                `Parsing ${humanText.substring(
                    0,
                    30
                )}... successful in ${duration.asSeconds()}s (${
                    cleaned.length
                }/${config.NUM_TRIES} successfully parsed responses) (${
                    reqTokens + resTokens
                }/${config.MAX_GPT_TOKENS} tokens)${
                    config.REPROCESS_POST_TEXT
                        ? ` (description: ${descriptionTokens}/${config.MAX_GPT_TOKENS} tokens)`
                        : ""
                }`
            );

            return obj;
        });
    }
}

export default Parser;
