import { Request, Response, Router } from "express";
import { checkSchema } from "express-validator";
import mongoose from "mongoose";
import { logger } from "../../shared/logger";
import { validate } from "../../middlewares/validate";
import scrapedRawDataSchema from "../../validators/raw";
import { ScrapedRawData } from "../../models/ScrapedRawData";
import { OK } from "http-status";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    logger.debug("Getting all parsed data");

    const data = await ScrapedRawData.find({});
    logger.debug("Parsed data retrieved successfully");

    return res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
    logger.debug("Getting parsed data by id");

    const data = await ScrapedRawData.findById(req.params.id);
    logger.debug("Parsed data retrieved successfully");

    return res.json(data);
});

router.post(
    "/",
    checkSchema(scrapedRawDataSchema),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Creating new raw data");

        const data = new ScrapedRawData(req.body);

        try {
            await data.save();
            logger.debug("Raw data saved successfully");

            return res.json(data);
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                logger.debug("Validation error");
                logger.debug(err.message);
                return res.json({ err: err.message });
            }
            logger.error("Error saving data");
            logger.error(err);
            return res.json({ err });
        }
    }
);

router.put(
    "/:id",
    checkSchema(scrapedRawDataSchema),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Updating raw data");

        const data = await ScrapedRawData.findById(req.params.id);

        if (!data) {
            logger.debug("Raw data not found");
            return res.json({ err: "Raw data not found" });
        }

        data.updateOne(req.body);

        try {
            await data.save();
            logger.debug("Raw data updated successfully");

            return res.json(data);
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                logger.debug("Validation error");
                logger.debug(err.message);
                return res.json({ err: err.message });
            }
            logger.error("Error saving data");
            logger.error(err);
            return res.json({ err });
        }
    }
);

router.delete("/:id", async (req: Request, res: Response) => {
    logger.debug("Deleting raw data");

    const data = await ScrapedRawData.findById(req.params.id);

    if (!data) {
        logger.debug("Raw data not found");
        return res.json({ err: "Raw data not found" });
    }

    try {
        await data.deleteOne();
        logger.debug("Raw data deleted successfully");

        return res.sendStatus(OK);
    } catch (err) {
        logger.error("Error deleting data");
        logger.error(err);
        return res.json({ err });
    }
});

export default router;
