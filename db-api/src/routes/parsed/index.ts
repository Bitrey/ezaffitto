import { Request, Response, Router } from "express";
import ScrapedParsedData from "../../models/ScrapedParsedData";
import { checkSchema, validationResult } from "express-validator";
import scrapedParsedDataSchema from "../../validators/parsed";
import mongoose from "mongoose";
import { logger } from "../../shared/logger";
import { validate } from "../../middlewares/validate";
import { OK } from "http-status";
import { config } from "../../config";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    logger.debug("Getting all parsed data");

    const data = await ScrapedParsedData.find({});
    logger.debug("Parsed data retrieved successfully");

    return res.json(data);
});

router.get("/postid/:id", async (req: Request, res: Response) => {
    logger.debug("Getting parsed data by postId");

    const data = await ScrapedParsedData.findOne({ postId: req.params.id });
    logger.debug("Parsed data retrieved successfully by postId");

    return res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
    logger.debug("Getting parsed data by id");

    const data = await ScrapedParsedData.findOne({ _id: req.params.id });
    logger.debug("Parsed data retrieved successfully");

    return res.json(data);
});

router.post(
    "/",
    checkSchema(scrapedParsedDataSchema),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Creating new parsed data");

        const data = new ScrapedParsedData(req.body);

        try {
            await data.save();
            logger.debug("Parsed data saved successfully");

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
    checkSchema(scrapedParsedDataSchema),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Updating parsed data");

        const data = await ScrapedParsedData.findById(req.params.id);

        if (!data) {
            logger.debug("Parsed data not found");
            return res.json({ err: "Parsed data not found" });
        }

        data.updateOne(req.body);

        try {
            await data.save();
            logger.debug("Parsed data updated successfully");

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
    logger.debug("Deleting parsed data");

    const data = await ScrapedParsedData.findById(req.params.id);

    if (!data) {
        logger.debug("Parsed data not found");

        return res.json({ err: "Parsed data not found" });
    }

    try {
        await data.deleteOne();
        logger.debug("Parsed data deleted successfully");

        return res.sendStatus(OK);
    } catch (err) {
        logger.error("Error deleting data");
        logger.error(err);
        return res.json({ err });
    }
});

export default router;
