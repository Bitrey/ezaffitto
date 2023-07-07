import { cleanEnv, str, num } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    PROMPT_PATH: str(),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    OPENAI_ORGANIZATION_ID: str(),
    OPENAI_API_KEY: str()
});
