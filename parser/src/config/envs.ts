import { cleanEnv, str, num } from "envalid";

export const envs = cleanEnv(process.env, {
    OPENAI_API_KEY: str(),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    PORT: num()
});
