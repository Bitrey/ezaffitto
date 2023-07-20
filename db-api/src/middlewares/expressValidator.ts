import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { BAD_REQUEST } from "http-status";

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return res
        .status(BAD_REQUEST)
        .json({ err: [...new Set(errors.array().map(e => e.msg))].join() });
};
