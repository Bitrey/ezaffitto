import { Request, Response, Router } from "express";
import ParsedData from "../../models/ParsedData";
import { logger } from "../../shared/logger";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, OK } from "http-status";
import { validateModel } from "../../middlewares/validateModel";
import { config } from "../../config";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    logger.debug("Getting all parsed data");

    const data = await ParsedData.find({});
    logger.debug("Parsed data retrieved successfully");

    return res.json(data);
});

router.get("/postid/:id", async (req: Request, res: Response) => {
    logger.debug("Getting parsed data by postId");

    const data = await ParsedData.findOne({ postId: req.params.id });
    logger.debug("Parsed data retrieved successfully by postId");

    return res.json(data);
});

router.post("/validate", validateModel(ParsedData), async (req, res) => {
    logger.debug("Validated parsed data");

    return res.sendStatus(OK);
});

router.get("/:id", async (req: Request, res: Response) => {
    logger.debug("Getting parsed data by id");

    const data = await ParsedData.findOne({ _id: req.params.id });
    logger.debug("Parsed data retrieved successfully");

    return res.json(data);
});

router.post(
    "/",
    validateModel(ParsedData),
    async (req: Request, res: Response) => {
        logger.debug("Creating new parsed data");

        const data = new ParsedData(req.body);

        const existing = await ParsedData.findOne({
            postId: req.body[config.POST_ID_KEY]
        });
        if (existing) {
            // abbiamo speso soldi inutilmente
            logger.error(
                `Raw data already exists for postId ${
                    req.body[config.POST_ID_KEY]
                }`
            );
            return res.json(existing);
        }

        try {
            await data.save();
            logger.info(
                `Parsed data with postId ${data.postId} saved successfully`
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
    validateModel(ParsedData),
    async (req: Request, res: Response) => {
        logger.debug("Updating parsed data");

        const data = await ParsedData.findById(req.params.id);

        if (!data) {
            logger.debug("Parsed data not found");
            return res
                .status(BAD_REQUEST)
                .json({ err: "Parsed data not found" });
        }

        data.updateOne(req.body);

        try {
            await data.save();
            logger.debug("Parsed data updated successfully");

            return res.json(data);
        } catch (err) {
            logger.error("Error saving data");
            logger.error(err);
            return res.status(INTERNAL_SERVER_ERROR).json({ err });
        }
    }
);

router.delete("/:id", async (req: Request, res: Response) => {
    logger.debug("Deleting parsed data");

    const data = await ParsedData.findById(req.params.id);

    if (!data) {
        logger.debug("Parsed data not found");

        return res.status(BAD_REQUEST).json({ err: "Parsed data not found" });
    }

    try {
        await data.deleteOne();
        logger.debug("Parsed data deleted successfully");

        return res.sendStatus(OK);
    } catch (err) {
        logger.error("Error deleting data");
        logger.error(err);
        return res.status(INTERNAL_SERVER_ERROR).json({ err });
    }
});

export default router;
