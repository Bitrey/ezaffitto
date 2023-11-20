import { cleanEnv, str, num } from "envalid";

import { readFileSync } from "fs";

export const envs = {
    ...cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ["development", "test", "production", "staging"]
        }),
        PORT: num()
    }),
    RECAPTCHA_SECRET: readFileSync(
        "/run/secrets/recaptcha_secret",
        "utf8"
    ).trim(),
    MONGODB_URI: readFileSync("/run/secrets/mongodb_uri", "utf8").trim()
};
