import { Telegraf } from "telegraf";
import { envs } from "./config/envs";

let KAFKA_PARSED_TOPIC="parsed.parser.*"


const bot = new Telegraf(envs.BOT_TOKEN)
bot.telegram.sendMessage(envs.CHANNEL_ID, 'AM ALIVE')
console.log("channel_id: ", envs.CHANNEL_ID)
