import { cleanEnv, str, num } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    CHANNEL_ID: str(),
    BOT_TOKEN: str(),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
});
