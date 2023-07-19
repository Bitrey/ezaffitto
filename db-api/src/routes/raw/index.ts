import { Request, Response, Router } from "express";
import { checkSchema } from "express-validator";
import mongoose from "mongoose";
import { logger } from "../../shared/logger";
import { validate } from "../../middlewares/validate";
import scrapedRawDataSchema from "../../validators/raw";
import { ScrapedRawData } from "../../models/ScrapedRawData";
import { CREATED, OK } from "http-status";
import { config } from "../../config";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    logger.debug("Getting all raw data");

    const data = await ScrapedRawData.find({});
    logger.debug("Raw data retrieved successfully");

    return res.json(data);
});

router.get("/postid/:id", async (req: Request, res: Response) => {
    logger.debug("Getting raw data by postId");

    const data = await ScrapedRawData.findOne({ postId: req.params.id });
    logger.debug("Raw data retrieved successfully by postId");

    return res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
    logger.debug("Getting raw data by id");

    const data = await ScrapedRawData.findOne({ _id: req.params.id });
    logger.debug("Raw data retrieved successfully");

    return res.json(data);
});

router.post(
    "/",
    checkSchema(scrapedRawDataSchema),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Creating new raw data");

        const existing = await ScrapedRawData.findOne({
            postId: req.body[config.POST_ID_KEY]
        });
        if (existing) {
            logger.debug("Raw data already exists");
            return res.json(existing);
        }

        const data = new ScrapedRawData(req.body);

        try {
            await data.save();
            logger.debug("Raw data saved successfully");

            return res.status(CREATED).json(data);
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
