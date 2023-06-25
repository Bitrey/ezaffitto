import { Telegraf } from "telegraf";
import { envs } from "./config/envs";
import { kafka } from "./config/kafka";
import { config } from "./config/config";
import { logger } from "./shared/logger";
import { Errors } from "./interfaces/Error";
import { RentalPost } from "./interfaces/RentalPost";
import { generateTelegramMessageFromJson } from "./messageformat";

let KAFKA_PARSED_TOPIC = /^parsed\.parser\..+/
const delay = (ms:any) => new Promise(resolve => setTimeout(resolve, ms))

const consumer = kafka.consumer({ groupId: config.KAFKA_GROUP_ID });


const bot = new Telegraf(envs.BOT_TOKEN)
//bot.telegram.sendMessage(envs.CHANNEL_ID, 'AM ALIVE')
console.log("channel_id: ", envs.CHANNEL_ID)



export const runConsumer = async () => {
    const delay = (ms:any) => new Promise(resolve => setTimeout(resolve, ms))
    //await delay(10000);
    await consumer.connect();
    await consumer.subscribe({
        topic: config.KAFKA_CONSUMER_TOPIC,
        //TODO: IS THIS NECESSARY?
        fromBeginning: config.KAFKA_FROM_BEGINNING,
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                if (!message.value) {
                    logger.error("Empty payload received from Kafka.");
                    throw new Error(Errors.KAFKA_RECEIVED_EMPTY_PAYLOAD);
                }

                let parsed: RentalPost
                try {
                    console.log(message.value.toString("utf-8"))
                    parsed = JSON.parse(message.value.toString("utf-8"))["post"];
                    //console.log(parsed)
                    // GUARDS GO HERE
                    // TODO: extrapolate in another function maybe
                    if(parsed.isRental && parsed.isForRent){
                        bot.telegram.sendMessage(envs.CHANNEL_ID, generateTelegramMessageFromJson(parsed), {parse_mode: "MarkdownV2"})
                        console.log("Sleeping before sending next message...")
                        delay(5000)
                    }
                } catch (err) {
                    logger.error(
                        `Malformed JSON data received from Kafka: ${message.value}.`
                    );
                    throw new Error(Errors.KAFKA_RECEIVED_MALFORMED_JSON_DATA);
                }

            } catch (error) {
                logger.debug("An error occurred in the Kafka consumer:", error);
                throw error;
            }

        }
    });
}

const run = async () => {
    await delay(10000);
    runConsumer();
};

run().catch(err => {
    logger.error("Error in Kafka run:");
    logger.error(err);
});