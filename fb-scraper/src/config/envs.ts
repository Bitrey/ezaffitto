import { cleanEnv, str } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    FB_ACCOUNT_EMAIL: str(),
    FB_ACCOUNT_PASSWORD: str()
});
