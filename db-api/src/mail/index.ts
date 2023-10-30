import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { envs } from "../config/envs";
import { logger } from "../shared/logger";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class EmailService {
    private static transporter: nodemailer.Transporter | null = null;

    private static _initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.debug("Initializing email service with credentials:");
            logger.debug(envs.MAIL_USERNAME);
            logger.debug(envs.MAIL_PASSWORD);
            logger.debug(envs.MAIL_SERVER);
            EmailService.transporter = nodemailer.createTransport({
                host: envs.MAIL_SERVER,
                auth: {
                    user: envs.MAIL_USERNAME.toString(),
                    pass: envs.MAIL_PASSWORD.toString()
                },
                port: 587,
                tls: {
                    rejectUnauthorized: false
                }
            } as SMTPTransport.Options);

            EmailService.transporter.verify((err, success): void => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                logger.info("Email ready: " + success);
                return resolve();
            });
        });
    }

    public static async sendMail(message: Mail.Options): Promise<void> {
        if (!EmailService.transporter) {
            await EmailService._initialize();
        }
        return new Promise((resolve, reject) => {
            if (!EmailService.transporter) {
                logger.error("EmailService.transporter null in sendMail");
                return reject("EmailService.transporter null");
            }
            EmailService.transporter.sendMail(message, err => {
                if (err) {
                    logger.error("Error while sending email");
                    logger.error(err);
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    public static async sendEmailToWebmaster(
        service: string,
        msg: any,
        date: Date
    ) {
        const message: Mail.Options = {
            from: `"ezaffitto.com" ${envs.SEND_EMAIL_FROM}`,
            to: envs.SEND_EMAIL_TO,
            subject: "EZAFFITTO.COM - PANIC",
            html:
                `<p>Received <strong>panic call</strong> from service <code>${service}</code>:<br /><pre><code>${msg}</pre><code><br />` +
                `Sent on <code>${date.toISOString()}</code></p>`
        };

        await EmailService.sendMail(message);
        logger.info(
            `New request sent to webmaster from ${envs.SEND_EMAIL_FROM} to ${envs.SEND_EMAIL_TO}, sent message:`
        );
        logger.info(message);
    }
}

export default EmailService;
