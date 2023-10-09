import { cleanEnv, str, num, bool } from "envalid";

import { readFileSync } from "fs";

export const envs = {
    ...cleanEnv(process.env, {
        MAIN_PROMPT_PATH: str(),
        DESCRIPTION_PROMPT_PATH: str(),
        NODE_ENV: str({
            choices: ["development", "test", "production", "staging"]
        }),
        DEBUG_START_EXPRESS_SERVER: bool(),
        PING_SERVER_PORT: num()
    }),
    OPENAI_API_KEY: readFileSync("/run/secrets/openai_api_key", "utf8")
};
