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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const edgegpt_1 = require("./parser/edgegpt");
const envs_1 = require("./config/envs");
const logger_1 = require("./shared/logger");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const parser = new edgegpt_1.Parser();
app.get("/parse", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.text) {
        return res.status(400).send("Missing text body parameter");
    }
    const parsed = yield parser.parse(req.body.text);
    if (parsed) {
        return res.status(200).json({ text: parsed });
    }
    else {
        return res.status(500).json({ err: "Error parsing text" });
    }
}));
app.listen(envs_1.envs.PORT, () => {
    logger_1.logger.info(`Parser server listening on port ${envs_1.envs.PORT}`);
});
