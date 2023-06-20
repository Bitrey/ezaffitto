"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerStream = exports.logger = void 0;
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const { combine, timestamp, colorize, errors, label, printf, splat, json, metadata } = winston_1.format;
const combinedLogsFile = path_1.default.join("./logs/combined.log");
const errorsLogsFile = path_1.default.join("./logs/error.log");
const errorStackFormat = (0, winston_1.format)(info => {
    if (info instanceof Error) {
        return Object.assign(Object.assign({}, info), {
            stack: info.stack,
            message: info.message
        });
    }
    return info;
});
const prettyJson = printf(info => {
    if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, 4);
    }
    return `${info.level}: ${info.message}`;
});
exports.logger = (0, winston_1.createLogger)({
    // change level if in dev environment versus production
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(label({ label: path_1.default.basename(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "") }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errorStackFormat(), metadata({ fillExcept: ["message", "level", "timestamp", "label"] })),
    transports: [
        new winston_1.transports.Console({
            format: combine(colorize(), printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`), errorStackFormat(), splat(), prettyJson)
        }),
        new winston_1.transports.File({
            filename: combinedLogsFile,
            format: combine(json(), errors(), errorStackFormat(), json(), timestamp()),
            maxsize: 10000000
        }),
        new winston_1.transports.File({
            filename: errorsLogsFile,
            level: "error",
            format: combine(json(), errors(), errorStackFormat(), json(), timestamp()),
            maxsize: 20000000
        })
    ]
});
class LoggerStream {
    write(message, encoding) {
        exports.logger.info(message);
    }
}
exports.LoggerStream = LoggerStream;
