import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { envs } from "../config/envs";
import requestIp from "request-ip";
import { logger } from "../shared/logger";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status";
import { config } from "../config";

interface RecaptchaRequest {
    secret: string;
    response: string;
    remoteip?: string;
}

interface RecaptchaResponse {
    success: boolean;
    "error-codes": string[];
    challenge_ts: string;
    hostname: string;
}

export async function captchaQueryParam(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { captcha } = req.query;

    logger.debug("token is " + captcha);

    if (typeof captcha !== "string") {
        return res.status(BAD_REQUEST).json({ err: "captcha.missing" });
    }

    try {
        const params = new URLSearchParams();
        params.append("secret", envs.RECAPTCHA_SECRET);
        params.append("response", captcha);
        const ip = requestIp.getClientIp(req);
        if (ip) params.append("remoteip", ip);

        const _res = await axios.post(
            config.RECAPTCHA_URL,
            params as URLSearchParams /* RecaptchaRequest */
        );
        const data: RecaptchaResponse = _res.data;

        if (data.success) {
            return next();
        } else {
            logger.debug("Recaptcha request failed");
            logger.debug(data);
            res.status(BAD_REQUEST).json({
                err: "captcha.failed"
            });
        }
    } catch (err) {
        logger.error("Error in Recaptcha request");
        logger.error(err);
        res.status(INTERNAL_SERVER_ERROR).json({ err: "errors.unknown" });
    }
}
