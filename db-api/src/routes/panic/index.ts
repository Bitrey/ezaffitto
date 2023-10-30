import { Request, Response, Router } from "express";
import { logger } from "../../shared/logger";
import { OK } from "http-status";
import { body } from "express-validator";
import { validate } from "../../middlewares/expressValidator";
import EmailService from "../../mail";

const router = Router();

router.post(
    "/",
    body("service").isString(),
    body("message").isString(),
    validate,
    async (req: Request, res: Response) => {
        logger.error("Received panic message");
        logger.error(req.body.message);

        try {
            await EmailService.sendEmailToWebmaster(
                req.body.service as string,
                JSON.stringify(req.body.message),
                new Date()
            );
        } catch (err) {
            logger.error("CRITICAL! Error sending panic email");
            logger.error(err);
        }

        return res.sendStatus(OK);
    }
);

export default router;
