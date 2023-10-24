import { Request, Response, Router } from "express";
import RentalPost, { RentalPostClass } from "../../models/RentalPost";
import { logger } from "../../shared/logger";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, OK } from "http-status";
import { validateModel } from "../../middlewares/validateModel";
import { config } from "../../config";
import { body, param, query } from "express-validator";
import { validate } from "../../middlewares/expressValidator";
import { FilterQuery } from "mongoose";

const router = Router();

// TODO: make these private!!
router.post(
    "/text",
    body("text").isString().isLength({ min: 1 }),
    body("source").isString().optional(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Getting data by text");

        const query: FilterQuery<RentalPostClass> = {
            description: req.body.text
        };
        if (req.body.source) {
            query.source = req.body.source;
        }

        const data = await RentalPost.findOne(query);
        if (data) {
            logger.debug(
                `Data retrieved successfully by text: postId ${
                    data?.postId
                }, text: ${data?.description?.slice(0, 30)}...`
            );
        } else {
            logger.debug(
                `Data not found by text "${(req.body.text as string).slice(
                    0,
                    30
                )}..."`
            );
        }

        return res.json(data);
    }
);

router.post("/validate", validateModel(RentalPost), async (req, res) => {
    logger.debug("Validated data");

    return res.sendStatus(OK);
});

router.get(
    "/:id",
    param("id").isMongoId(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Getting data by id");

        const data = await RentalPost.findOne({ _id: req.params.id });
        logger.debug("Data retrieved successfully");

        return res.json(data);
    }
);

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

        const query: FilterQuery<RentalPostClass> = {
            $or: [{ postId: req.body[config.POST_ID_KEY] }]
        };

        if (req.body.description) {
            (query.$or as FilterQuery<RentalPostClass>[]).push({
                description: req.body.description
            });
        }

        const existing = await RentalPost.findOne(query);
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
    param("id").isMongoId(),
    validate,
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

router.delete(
    "/:id",
    param("id").isMongoId(),
    validate,
    async (req: Request, res: Response) => {
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
    }
);

export default router;
