import { Request, Response, Router } from "express";
import RentalPost, {
    RentalPostClass,
    RentalTypes
} from "../../models/RentalPost";
import { logger } from "../../shared/logger";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, OK } from "http-status";
import { validateModel } from "../../middlewares/validateModel";
import { config } from "../../config";
import { query } from "express-validator";
import { validate } from "../../middlewares/expressValidator";
import { FilterQuery } from "mongoose";
import { captchaQueryParam } from "../../middlewares/captcha";

const router = Router();

router.get(
    "/",
    // TODO add in prod DEBUG
    // captchaQueryParam,
    query("limit").isInt().optional(),
    query("skip").isInt().optional(),
    query("maxPrice").isInt({ gt: 0 }).optional(),
    // TODO! fixa questo
    // isIn(Object.values(RentalTypes))
    query("rentalTypes").isArray().optional(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug(
            `Getting all data skipping ${
                req.query.skip || "none"
            } limiting to ${req.query.limit || Infinity}`
        );

        const query: FilterQuery<RentalPostClass> = {
            isRental: true,
            isForRent: true
        };

        const rentalTypes = req.query.rentalTypes as RentalTypes[] | null;
        if (rentalTypes) query.rentalType = { $in: rentalTypes };

        if (req.query.maxPrice) {
            query.monthlyPrice = {
                $lt: parseInt(req.query.maxPrice as string)
            };
        }

        const data = RentalPost.find(query).sort({ date: -1 });
        if (req.query.limit) {
            data.limit(parseInt(req.query.limit as string));
        }
        if (req.query.skip) {
            data.skip(parseInt(req.query.skip as string));
        }

        const result = await data.exec();

        logger.debug(`Data retrieved successfully (total: ${result.length})`);

        return res.json(result);
    }
);

// TODO: make these private!!
router.get(
    "/text",
    query("text").isString().isLength({ min: 1 }),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Getting data by text");

        const data = await RentalPost.findOne({
            rawDescription: req.query.text
        });
        if (data) {
            logger.debug(
                `Data retrieved successfully by text: postId ${
                    data?.postId
                }, text: ${data?.rawDescription?.slice(0, 30)}...`
            );
        } else {
            logger.debug(
                `Data not found by text "${(req.query.text as string).slice(
                    0,
                    30
                )}..."`
            );
        }

        return res.json(data);
    }
);

router.get("/count", async (req: Request, res: Response) => {
    logger.debug("Getting data count");

    const count = await RentalPost.countDocuments();
    logger.debug("Data count retrieved successfully");

    return res.json({ count });
});

router.get("/postid/:id", async (req: Request, res: Response) => {
    logger.debug("Getting data by postId");

    const data = await RentalPost.findOne({ postId: req.params.id });
    logger.debug("Data retrieved successfully by postId");

    return res.json(data);
});

router.post("/validate", validateModel(RentalPost), async (req, res) => {
    logger.debug("Validated data");

    return res.sendStatus(OK);
});

router.get("/:id", async (req: Request, res: Response) => {
    logger.debug("Getting data by id");

    const data = await RentalPost.findOne({ _id: req.params.id });
    logger.debug("Data retrieved successfully");

    return res.json(data);
});

router.post(
    "/",
    validateModel(RentalPost),
    async (req: Request, res: Response) => {
        logger.debug(
            "Creating new rental post " +
                req.body[config.POST_ID_KEY] +
                ": " +
                req.body.description?.slice(0, 30) +
                "..."
        );

        const data = new RentalPost(req.body);

        const existing = await RentalPost.findOne({
            $or: [
                { postId: req.body[config.POST_ID_KEY] },
                { description: req.body.description }
            ]
        });
        if (existing) {
            // abbiamo speso soldi inutilmente
            // 05/10/2023 NON È VERO
            logger.debug(
                `Data already exists for postId ${
                    req.body[config.POST_ID_KEY]
                } (${existing.description?.slice(0, 30)}...)`
            );
            return res.json(existing);
        }

        try {
            await data.save();
            logger.info(`postId ${data.postId} saved successfully`);

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
    validateModel(RentalPost),
    async (req: Request, res: Response) => {
        logger.debug("Updating data");

        const data = await RentalPost.findById(req.params.id);

        if (!data) {
            logger.debug("Data not found");
            return res.status(BAD_REQUEST).json({ err: "Data not found" });
        }

        data.updateOne(req.body);

        try {
            await data.save();
            logger.debug("Data updated successfully");

            return res.json(data);
        } catch (err) {
            logger.error("Error saving data");
            logger.error(err);
            return res.status(INTERNAL_SERVER_ERROR).json({ err });
        }
    }
);

router.delete("/:id", async (req: Request, res: Response) => {
    logger.debug("Deleting data");

    const data = await RentalPost.findById(req.params.id);

    if (!data) {
        logger.debug("Data not found");

        return res.status(BAD_REQUEST).json({ err: "Data not found" });
    }

    try {
        await data.deleteOne();
        logger.debug("Data deleted successfully");

        return res.sendStatus(OK);
    } catch (err) {
        logger.error("Error deleting data");
        logger.error(err);
        return res.status(INTERNAL_SERVER_ERROR).json({ err });
    }
});

export default router;
