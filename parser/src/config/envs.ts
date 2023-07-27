import { cleanEnv, str, num, bool } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    MAIN_PROMPT_PATH: str(),
    DESCRIPTION_PROMPT_PATH: str(),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    OPENAI_ORGANIZATION_ID: str(),
    OPENAI_API_KEY: str(),
    DEBUG_START_EXPRESS_SERVER: bool()
});
