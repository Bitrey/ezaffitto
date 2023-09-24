import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "../shared/logger";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status";

export function validateModel(model: mongoose.Model<any>) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            await model.validate(req.body);
            next();
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                logger.warn("Validation error while running validator");
                logger.warn(err.message);
                res.status(BAD_REQUEST).json({ err: err.message });
            } else {
                logger.error("Non-mongoose error while running validator");
                logger.error(err);
                res.status(INTERNAL_SERVER_ERROR).json({ err: "Server error" });
            }
        }
    };
}
