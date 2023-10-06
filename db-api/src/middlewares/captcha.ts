import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { envs } from "../config/envs";
import requestIp from "request-ip";
import { logger } from "../shared/logger";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status";

interface TurnstileRequest {
    secret: string;
    response: string;
    remoteip?: string;
}

interface TurnstileResponse {
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
    const captcha = req.query;
    if (!captcha) {
        return res.status(BAD_REQUEST).json({ err: "Missing captcha" });
    }

    try {
        const _res = await axios.post(config.TURNSTILE_URL, {
            secret: envs.TURNSTILE_SECRET,
            response: req.params!.token,
            remoteip: requestIp.getClientIp(req)
        } as TurnstileRequest);
        const data: TurnstileResponse = _res.data;

        if (data.success) {
            return next();
        } else {
            logger.debug("Turnstile request failed");
            logger.debug(data);
            res.status(BAD_REQUEST).json({
                success: false,
                err: "Anti-bot verification failed"
            });
        }
    } catch (err) {
        logger.error("Error in Turnstile request");
        logger.error(err);
        res.status(INTERNAL_SERVER_ERROR).json({ err: "Server error" });
    }
}
