// import * as amqp from "amqplib";
// import exitHook from "async-exit-hook";
// import { logger } from "../shared/logger";
// import { config } from "../config";
// import { Ad, RentalPost, SentData } from "../interfaces";
// import { scrapedDataEvent } from "..";

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

//     logger.info(`RabbitMQ publisher publishing on topic ${config.RAW_TOPIC} and ${config.PARSED_TOPIC}...`);

//     scrapedDataEvent.on("scrapedData", async (data: Ad[]) => {
//         logger.info(
//             "Sending data to RabbitMQ on topic " + config.RAW_TOPIC + "..."
//         );

//         // TODO send raw data in future?
//         const queue: Ad[] = [];

//         for (const datum of data) {
//             try {
//                 channel.publish(
//                     config.RABBITMQ_EXCHANGE,
//                     config.RAW_TOPIC,
//                     Buffer.from(JSON.stringify(datum))
//                 );
//                 logger.info(
//                     `Sent postId ${datum.urn} to RabbitMQ on topic ${config.RAW_TOPIC}`
//                 );

//                 // try to send queue
//                 while (queue.length > 0) {
//                     const dataToSend = queue.shift();
//                     channel.publish(
//                         config.RABBITMQ_EXCHANGE,
//                         config.RAW_TOPIC,
//                         Buffer.from(JSON.stringify(dataToSend))
//                     );
//                     logger.info(
//                         `Sent postId ${dataToSend!.urn} to RabbitMQ on topic ${
//                             config.RAW_TOPIC
//                         }`
//                     );
//                 }
//             } catch (err) {
//                 logger.error("Error sending data to RabbitMQ");
//                 logger.error(err);

//                 queue.push(datum);
//             }
//         }
//     });
// };
