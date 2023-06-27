import { cleanEnv, str, num } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    PROMPT_PATH: str(),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    GPT_HOST: str(),
    GPT_PORT: num()
});
