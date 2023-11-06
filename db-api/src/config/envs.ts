import { cleanEnv, str, num } from "envalid";
import { readFileSync } from "fs";

export const envs = {
    ...cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ["development", "test", "production", "staging"]
        }),
        PORT: num(),
        MAIL_SERVER: str(),
        SEND_EMAIL_FROM: str(),
        SEND_EMAIL_TO: str()
    }),
    MONGODB_URI: readFileSync("/run/secrets/mongodb_uri", "utf8").trim(),
    MAIL_USERNAME: readFileSync("/run/secrets/mail_username", "utf8").trim(),
    MAIL_PASSWORD: readFileSync("/run/secrets/mail_password", "utf8").trim(),
    GEOLOCATION_API_KEY: readFileSync(
        "/run/secrets/geolocation_api_key",
        "utf8"
    ).trim()
};
