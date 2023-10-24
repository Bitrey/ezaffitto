import { cleanEnv, str, num } from "envalid";

import { readFileSync } from "fs";

export const envs = {
    ...cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ["development", "test", "production", "staging"]
        }),
        PORT: num(),
        MONGODB_URI: str()
    }),
    TURNSTILE_SECRET: readFileSync("/run/secrets/turnstile_secret", "utf8")
};
