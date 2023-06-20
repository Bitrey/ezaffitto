import { cleanEnv, str, num } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    PYTHON_PARSER_PATH: str(),
    PROMPT_PATH: str(),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    PORT: num()
});
