import { Router } from "express";

import bodyParser from "body-parser";

import rawDataRoutes from "./raw";
import parsedDataRoutes from "./parsed";
import pingRoute from "./ping";
import { logger } from "../shared/logger";

const router = Router();

router.use(bodyParser.json());

router.use((req, res, next) => {
    try {
        for (const k in req.body) {
            if (req.body[k] === "") {
                req.body[k] = null;
            }
            if (req.body[k] === null || req.body[k] === undefined) {
                delete req.body[k];
            }
        }
    } catch (err) {
        logger.debug("Error while cleaning empty strings from request body");
        logger.debug(err);
    }
    next();
});

router.use("/raw", rawDataRoutes);
router.use("/parsed", parsedDataRoutes);
router.use("/ping", pingRoute);

export default router;
