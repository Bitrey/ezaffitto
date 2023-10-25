import { Request, Response, Router } from "express";
import { param, query } from "express-validator";
import { captchaQueryParam } from "../../middlewares/captcha";
import { validate } from "../../middlewares/expressValidator";
import { logger } from "../../shared/logger";
import { RentalTypes } from "../../interfaces/shared";
import { db } from "../../config/db";
import { ObjectId } from "mongodb";

const router = Router();

router.get(
    "/",
    captchaQueryParam,
    query("limit").isInt().optional(),
    query("skip").isInt().optional(),
    query("maxPrice").isInt({ gt: 0 }).optional(),
    // TODO! fixa questo
    // isIn(Object.values(RentalTypes))
    query("rentalTypes").isArray().optional(),
    query("q").isString().optional(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug(
            `Getting all data skipping ${
                req.query.skip || "none"
            } limiting to ${req.query.limit || Infinity}`
        );

        const query: any = {
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

        if (req.query.q) {
            query.$text = {
                $search: req.query.q as string,
                $caseSensitive: false,
                $diacriticSensitive: false
            };
        }

        const collection = (await db).collection("rentalposts");
        const data = collection.find(query).sort({ date: -1 });

        if (req.query.limit) {
            data.limit(parseInt(req.query.limit as string));
        }
        if (req.query.skip) {
            data.skip(parseInt(req.query.skip as string));
        }

        const result = await data.toArray();

        const count = await collection.countDocuments();

        logger.debug(
            `Data retrieved successfully (total: ${result.length}/${count})`
        );

        return res.json({ data: result, count });
    }
);

router.get(
    "/:id",
    captchaQueryParam,
    param("id").isMongoId(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug("Getting data by _id");

        const collection = (await db).collection("rentalposts");
        const data = await collection.findOne({
            _id: new ObjectId(req.params.id)
        });

        logger.debug("Data retrieved successfully by _id " + req.params.id);

        if (!data) {
            return res.status(404).json({ err: "Not found" });
        }

        return res.json(data);
    }
);

export default router;
