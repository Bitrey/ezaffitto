import { cleanEnv, num } from "envalid";

import "dotenv/config";

export const envs = cleanEnv(process.env, {
    PING_SERVER_PORT: num()
});
