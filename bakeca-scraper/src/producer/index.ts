// import * as amqp from "amqplib";
// import exitHook from "async-exit-hook";
// import { logger } from "../shared/logger";
// import { config } from "../config";
// import { BakecaRoot, RentalPost, SentData } from "../interfaces";
// import { parsedDataEvent, scrapedDataEvent } from "..";

// export const runProducer = async () => {
//     const connection = await amqp.connect(config.RABBITMQ_URL);
//     const channel = await connection.createChannel();

//     exitHook(() => {
//         logger.info(`Closing RabbitMQ producer connection...`);
//         connection.close();
//     });

//     await channel.assertExchange(config.RABBITMQ_EXCHANGE, "topic", {
//         durable: true
//     });

//     logger.info(
//         `RabbitMQ publisher publishing on topic ${config.RAW_TOPIC} and ${config.PARSED_TOPIC}...`
//     );

//     scrapedDataEvent.on("scrapedData", async (data: BakecaRoot) => {
//         logger.info(
//             "Sending data to RabbitMQ on topic " + config.RAW_TOPIC + "..."
//         );

//         const dataToSend: SentData = {
//             postId: data.productID,
//             rawMessage: data.description,
//             scraperRawData: data
//         };

//         // TODO send raw data in future?
//         try {
//             channel.publish(
//                 config.RABBITMQ_EXCHANGE,
//                 config.RAW_TOPIC,
//                 Buffer.from(JSON.stringify(dataToSend))
//             );
//             logger.info(
//                 `Sent postId ${data.productID} to RabbitMQ on topic ${config.RAW_TOPIC}`
//             );
//         } catch (err) {
//             logger.error("Error sending data to RabbitMQ");
//             logger.error(err);
//         }
//     });

//     parsedDataEvent.on("parsedData", async (data: RentalPost) => {
//         logger.info(
//             "Sending data to RabbitMQ on topic " + config.PARSED_TOPIC + "..."
//         );

//         // TODO send raw data in future?
//         try {
//             channel.publish(
//                 config.RABBITMQ_EXCHANGE,
//                 config.PARSED_TOPIC,
//                 Buffer.from(JSON.stringify(data))
//             );
//             logger.info(
//                 `Sent postId ${data.postId} to RabbitMQ on topic ${config.PARSED_TOPIC}`
//             );
//         } catch (err) {
//             logger.error("Error sending data to RabbitMQ");
//             logger.error(err);
//         }
//     });
// };
