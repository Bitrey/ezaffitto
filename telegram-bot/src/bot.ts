import axios from "axios";
import { bot } from ".";
import { logger } from "./shared/logger";
import { client as redisClient } from "./redis";
import { formatTelegramMessage } from "./formatMessage";

const instance = axios.create({
    baseURL: "http://db-api:5500/api"
});

const welcomeMsg =
    "Benvenuto su ezaffitto!\n" +
    "Avviando questo bot, accetti i seguenti termini e condizioni: https://ezaffitto.it/termini-e-condizioni\n" +
    "Per iniziare, clicca sul tasto Avvia";

async function getUserCursor(ctx: any) {
    const userId = ctx.from?.id;

    if (!userId) {
        logger.warn("ctx.from.id is null (ctx is )" + JSON.stringify(ctx));
        ctx.reply("Errore nel bot (non ti trovo)");
        return null;
    }

    const val = await redisClient.get("cursor_" + userId);
    const cursor = val ? parseInt(val) : 0;

    return { userId, cursor };
}

async function sendData(ctx: any, rentalType?: string) {
    const res = await getUserCursor(ctx);
    if (!res) return;

    logger.debug("Sending data to user " + res.userId);

    const { cursor } = res;

    let fetchedData = null,
        count = null;
    try {
        const _fetchedDataRes = await instance.get("/parsed", {
            params: { limit: 1, skip: cursor, rentalType }
        });
        fetchedData = _fetchedDataRes.data;

        if (!rentalType) {
            const _countRes = await instance.get("/parsed/count");
            count = _countRes.data.count;
        }
    } catch (err) {
        logger.error("Errore durante la richiesta a db-api:", err);
        return ctx.reply("Errore nel bot (non riesco a contattare il server)");
    }

    if (fetchedData.length === 0) {
        ctx.answerCbQuery("Non ci sono altri post successivi");
        return;
    }

    const message = formatTelegramMessage(
        cursor,
        count || Infinity,
        fetchedData[0]
    );

    const kb = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "⏮️", callback_data: "back" },
                    { text: "⏭️", callback_data: "next" }
                ]
            ]
        },
        parse_mode: "Markdown"
    };

    try {
        ctx.editMessageText(message, kb);
    } catch (err) {
        logger.debug("ctx.editMessageText failed, sending new message");
        ctx.reply(message, kb);
    }

    // if (fetchedData[0].latitude && fetchedData[0].longitude) {
    //     ctx.sendLocation(fetchedData[0].latitude, fetchedData[0].longitude);
    // }
}

export async function setupBot() {
    bot.start(ctx => {
        ctx.reply(welcomeMsg, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Avvia", callback_data: "startBot" }]
                ]
            }
        });
    });

    bot.action("startBot", async ctx => {
        sendData(ctx);
    });

    bot.command("singleRoom", async ctx => {
        sendData(ctx, "singleRoom");
    });

    bot.command("doubleRoom", async ctx => {
        sendData(ctx, "doubleRoom");
    });

    bot.action("back", async ctx => {
        const res = await getUserCursor(ctx);
        if (!res) return;

        const { userId, cursor } = res;

        if (cursor > 0) {
            await redisClient.set("cursor_" + userId, cursor - 1, { EX: 60 });
            sendData(ctx);
        } else {
            ctx.answerCbQuery("Non ci sono altri post precedenti");
        }
    });

    bot.action("next", async ctx => {
        const res = await getUserCursor(ctx);
        if (!res) return;

        const { userId, cursor } = res;

        await redisClient.set("cursor_" + userId, cursor + 1);
        sendData(ctx);
    });

    bot.command("setcursor", async ctx => {
        const res = await getUserCursor(ctx);
        if (!res) return;

        const { userId } = res;

        const args = ctx.message.text.split(" ");
        if (args.length !== 2) {
            return ctx.reply("Errore: comando non valido");
        }

        const newCursor = parseInt(args[1]);
        if (isNaN(newCursor)) {
            return ctx.reply("Errore: comando non valido");
        }

        await redisClient.set("cursor_" + userId, newCursor);
        ctx.reply("Cursor impostato a " + newCursor);
    });

    bot.launch()
        .then(() => {
            logger.info("Bot avviato");
        })
        .catch(err => {
            logger.error("Errore durante l'avvio del bot:", err);
        });
}
