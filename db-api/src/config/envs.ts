import { cleanEnv, str, num } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"]
    }),
    PORT: num()
});
