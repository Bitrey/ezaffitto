"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const promises_1 = require("fs/promises");
const envs_1 = require("../config/envs");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../shared/logger");
const config_1 = require("../config/config");
class Parser {
    constructor() {
        this.extractJSON = (input) => {
            const match = input.match(/{[\s\S]*?}/);
            try {
                return match ? JSON.parse(match[0]) : null;
            }
            catch (error) {
                console.error("Errore durante il parsing del JSON:", error);
                return null;
            }
        };
    }
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getPrompt(humanText) {
        return __awaiter(this, void 0, void 0, function* () {
            const basePrompt = yield (0, promises_1.readFile)(path_1.default.join(process.cwd(), envs_1.envs.PROMPT_PATH), "utf-8");
            return basePrompt.replace("{0}", humanText);
        });
    }
    fetchEdgeGpt(humanText) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = yield this.getPrompt(humanText);
            return new Promise((resolve, reject) => {
                let dataToSend = "";
                const python = (0, child_process_1.spawn)("python3", [
                    path_1.default.join(process.cwd(), envs_1.envs.PYTHON_PARSER_PATH),
                    prompt
                ]);
                python.stdout.on("data", function (data) {
                    logger_1.logger.debug("\nPipe data from python script:");
                    logger_1.logger.debug(data.toString() + "\n");
                    dataToSend = data.toString();
                });
                python.on("error", function (data) {
                    logger_1.logger.error("Error (error event) from Python parser script:");
                    logger_1.logger.error(data);
                    return resolve(null);
                });
                python.stderr.on("data", data => {
                    logger_1.logger.error("Error (stderr.data event) from Python parser script:");
                    logger_1.logger.error(data);
                    return resolve(null);
                });
                python.on("close", code => {
                    logger_1.logger.debug(`Child process close all stdio with code ${code}`);
                    try {
                        return resolve(JSON.parse(dataToSend));
                    }
                    catch (err) {
                        logger_1.logger.error("Error parsing JSON from Python parser script:");
                        logger_1.logger.error(err);
                        return resolve(null);
                    }
                });
            });
        });
    }
    findMostConsistent(rentalPosts) {
        if (rentalPosts.length === 0) {
            return null;
        }
        let scores = new Array(rentalPosts.length).fill(0);
        for (let i = 0; i < rentalPosts.length; i++) {
            for (let j = 0; j < rentalPosts.length; j++) {
                if (i !== j) {
                    scores[i] += this.calculateSimilarityScore(rentalPosts[i], rentalPosts[j]);
                }
            }
        }
        const maxIndex = scores.indexOf(Math.max(...scores));
        return rentalPosts[maxIndex];
    }
    calculateSimilarityScore(a, b) {
        let score = 0;
        for (const key in a) {
            if (key !== "description" &&
                Object.prototype.hasOwnProperty.call(a, key)) {
                const aValue = a[key];
                const bValue = b[key];
                if (aValue instanceof Date && bValue instanceof Date) {
                    // Compare dates
                    if (aValue.getTime() === bValue.getTime()) {
                        score++;
                    }
                }
                else {
                    // Compare other properties
                    if (aValue === bValue) {
                        score++;
                    }
                }
            }
        }
        return score;
    }
    parse(humanText) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`Parsing: ${humanText}`);
            try {
                const fetchPromises = [];
                for (let i = 0; i < config_1.config.NUM_TRIES; i++) {
                    fetchPromises.push(this.fetchEdgeGpt(humanText));
                    yield Parser.wait(config_1.config.DELAY_BETWEEN_TRIES_MS);
                }
                const fetchedResults = yield Promise.all(fetchPromises);
                logger_1.logger.debug("Fetched from EdgeGPT:");
                logger_1.logger.debug(JSON.stringify(fetchedResults, null, 4));
                const successfullyFetched = fetchedResults.filter(e => e !== null && typeof (e === null || e === void 0 ? void 0 : e.text) === "string");
                if (successfullyFetched.length === 0) {
                    logger_1.logger.error("No successful fetches");
                    return null;
                }
                const cleanedArr = successfullyFetched
                    .map(e => this.extractJSON(e === null || e === void 0 ? void 0 : e.text))
                    .filter(e => e !== null);
                if (cleanedArr.length === 0) {
                    logger_1.logger.error("JSON parsed array is empty");
                    return null;
                }
                const cleaned = this.findMostConsistent(cleanedArr);
                return cleaned;
            }
            catch (err) {
                logger_1.logger.error(`Error parsing: ${humanText}`);
                logger_1.logger.error(err);
                return null;
            }
        });
    }
}
exports.Parser = Parser;
