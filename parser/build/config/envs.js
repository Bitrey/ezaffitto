"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = void 0;
const envalid_1 = require("envalid");
require("dotenv/config");
exports.envs = (0, envalid_1.cleanEnv)(process.env, {
    PYTHON_PARSER_PATH: (0, envalid_1.str)(),
    PROMPT_PATH: (0, envalid_1.str)(),
    NODE_ENV: (0, envalid_1.str)({
        choices: ["development", "test", "production", "staging"]
    }),
    PORT: (0, envalid_1.num)()
});
