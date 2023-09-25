import { Request, Response, Router } from "express";
import { logger } from "../../shared/logger";
import RawData, { IRawDataSchema } from "../../models/RawData";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, OK } from "http-status";
import { config } from "../../config";
import { validateModel } from "../../middlewares/validateModel";
import { param, query } from "express-validator";
import { validate } from "../../middlewares/expressValidator";
import { FilterQuery } from "mongoose";

const router = Router();

router.get(
    "/",
    query("isRentalNotFalse").isBoolean().optional(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Getting all raw data");

        const query: FilterQuery<IRawDataSchema> = {};

        if (req.query.isRentalNotFalse === "true") {
            query.isRental = { $ne: false };
        }

        const data = await RawData.find(query).sort({ createdAt: -1 });
        logger.debug("Raw data retrieved successfully");

        return res.json(data);
    }
);

router.get(
    "/not-rental/:id",
    param("id").isString().isLength({ min: 1 }),
    validate,
    async (req: Request, res: Response) => {
        const postId: string = req.params.id;

        logger.debug(`Setting postId ${postId} to not rental`);

        await RawData.findOneAndUpdate({ postId }, { isRental: false });

        return res.sendStatus(OK);
    }
);

router.get("/postid/:id", async (req: Request, res: Response) => {
    logger.debug("Getting raw data by postId");

    const data = await RawData.findOne({ postId: req.params.id });
    logger.debug("Raw data retrieved successfully by postId");

    return res.json(data);
});

router.get(
    "/text",
    query("text").isString().isLength({ min: 1 }),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Getting raw data by text");

        const data = await RawData.findOne({ rawMessage: req.query.text });
        logger.debug(
            `Raw data retrieved successfully by text: postId ${
                data?.postId
            }, text: ${data?.rawMessage?.slice(0, 30)}...`
        );
        if (!data?.postId) {
            logger.debug("No postId, full obj: " + JSON.stringify(data));
        }

        return res.json(data);
    }
);

router.post("/validate", validateModel(RawData), async (req, res) => {
    logger.debug("Validated raw data");

    return res.sendStatus(OK);
});

router.get("/:id", async (req: Request, res: Response) => {
    logger.debug("Getting raw data by id");

    const data = await RawData.findOne({ _id: req.params.id });
    logger.debug("Raw data retrieved successfully");

    return res.json(data);
});

router.post(
    "/",
    validateModel(RawData),
    async (req: Request, res: Response) => {
        logger.debug("Creating new raw data");

        const existing = await RawData.findOne({
            postId: req.body[config.POST_ID_KEY]
        });
        if (existing) {
            logger.warn(
                `Raw data already exists for postId ${
                    req.body[config.POST_ID_KEY]
                }`
            );
            return res.json(existing);
        }

        const data = new RawData(req.body);

        try {
            await data.save();
            logger.info(
                `Raw data with postId ${data.postId} saved successfully`
            );

            return res.status(CREATED).json(data);
        } catch (err) {
            logger.error("Error saving data");
            logger.error(err);
            return res.status(INTERNAL_SERVER_ERROR).json({ err });
        }
    }
);

router.put(
    "/:id",
    validateModel(RawData),
    async (req: Request, res: Response) => {
        logger.debug("Updating raw data");

        const data = await RawData.findById(req.params.id);

        if (!data) {
            logger.debug("Raw data not found");
            return res.status(BAD_REQUEST).json({ err: "Raw data not found" });
        }

        data.updateOne(req.body);

        try {
            await data.save();
            logger.debug("Raw data updated successfully");

            return res.json(data);
        } catch (err) {
            logger.error("Error saving data");
            logger.error(err);
            return res.status(INTERNAL_SERVER_ERROR).json({ err });
        }
    }
);

router.delete("/:id", async (req: Request, res: Response) => {
    logger.debug("Deleting raw data");

    const data = await RawData.findById(req.params.id);

    if (!data) {
        logger.debug("Raw data not found");
        return res.status(BAD_REQUEST).json({ err: "Raw data not found" });
    }

    try {
        await data.deleteOne();
        logger.debug("Raw data deleted successfully");

        return res.sendStatus(OK);
    } catch (err) {
        logger.error("Error deleting data");
        logger.error(err);
        return res.status(INTERNAL_SERVER_ERROR).json({ err });
    }
});

export default router;
