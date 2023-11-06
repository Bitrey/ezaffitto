import { cleanEnv, num, str } from "envalid";
import { readFileSync } from "fs";

export const envs = {
    ...cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ["development", "test", "production", "staging"]
        }),
        PING_SERVER_PORT: num()
    }),
    FB_ACCOUNT_EMAIL: readFileSync(
        "/run/secrets/fb_account_email",
        "utf8"
    ).trim(),
    FB_ACCOUNT_PASSWORD: readFileSync(
        "/run/secrets/fb_account_password",
        "utf8"
    ).trim()
};
