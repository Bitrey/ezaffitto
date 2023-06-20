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
class Parser {
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
                    logger_1.logger.debug("Pipe data from python script ...");
                    dataToSend = data.toString();
                });
                python.on("error", function (data) {
                    logger_1.logger.error("Error (error event) from python parser script:");
                    logger_1.logger.error(data);
                    reject(data);
                });
                python.stderr.on("data", data => {
                    logger_1.logger.error("Error (stderr.data event) from python parser script:");
                    logger_1.logger.error(data);
                    reject(data);
                });
                python.on("close", code => {
                    logger_1.logger.debug(`Child process close all stdio with code ${code}`);
                    resolve(dataToSend);
                });
            });
        });
    }
    parse(humanText) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`Parsing: ${humanText}`);
            try {
                return yield this.fetchEdgeGpt(humanText);
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
