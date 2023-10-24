import { cleanEnv, str, num } from "envalid";

export const envs = {
    ...cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ["development", "test", "production", "staging"]
        }),
        PORT: num(),
        MONGODB_URI: str()
    })
};
