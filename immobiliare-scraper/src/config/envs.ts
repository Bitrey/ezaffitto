import { cleanEnv, num } from "envalid";

export const envs = cleanEnv(process.env, {
    PING_SERVER_PORT: num()
});
