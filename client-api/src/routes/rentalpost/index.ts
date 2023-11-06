import { Request, Response, Router } from "express";
import { param, query } from "express-validator";
import { captchaQueryParam } from "../../middlewares/captcha";
import { validate } from "../../middlewares/expressValidator";
import { logger } from "../../shared/logger";
import { RentalTypes } from "../../interfaces/shared";
import { db } from "../../config/db";
import { Document, Filter, ObjectId, Sort } from "mongodb";
import moment from "moment";
import { config } from "../../config";
import { NOT_FOUND } from "http-status";

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
    query("orderBy").isIn(config.orderByOptions).optional(),
    validate,
    async (req: Request, res: Response) => {
        logger.debug(
            `Getting all data skipping ${
                req.query.skip || "none"
            } limiting to ${req.query.limit || Infinity}`
        );

        const query: Filter<Document> = {
            isRental: true,
            isForRent: true,
            date: { $gte: moment().subtract(3, "months").toDate() }
        };

        const rentalTypes = req.query.rentalTypes as RentalTypes[] | null;
        // aggiungo 'other' a rentalTypes
        if (rentalTypes)
            query.rentalType = {
                $in: [...new Set([...rentalTypes, RentalTypes.OTHER])]
            };

        if (req.query.maxPrice) {
            query.$or = [
                {
                    monthlyPrice: {
                        $lte: parseInt(req.query.maxPrice as string)
                    }
                },
                { monthlyPrice: { $exists: false } }
            ];
        }

        if (req.query.q) {
            query.$text = {
                $search: req.query.q as string,
                $caseSensitive: false,
                $diacriticSensitive: false
            };
        }

        let sort: Sort;
        // orderByOptions: ["priceAsc", "priceDesc", "dateAsc", "dateDesc"] as const
        if (req.query.orderBy) {
            switch (req.query.orderBy) {
                case "priceAsc":
                    sort = { monthlyPrice: 1 };
                    break;
                case "priceDesc":
                    sort = { monthlyPrice: -1 };
                    break;
                case "dateAsc":
                    sort = { date: 1 };
                    break;
                case "dateDesc":
                    sort = { date: -1 };
                    break;
                default:
                    // default is date descending
                    sort = { date: -1 };
                    break;
            }
        } else {
            sort = { date: -1 };
        }

        logger.debug("Sorting by " + JSON.stringify(sort));

        const collection = (await db).collection("rentalposts");
        const data = collection
            .find(query)
            .project({
                // remove fields that are illegal to send to the client
                postId: false,
                rawData: false,
                authorUserId: false,
                authorUsername: false,
                authorUrl: false,
                isRental: false,
                isForRent: false
            })
            .sort(sort);

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
        const data = await collection.findOne(
            {
                _id: new ObjectId(req.params.id),
                isRental: true,
                isForRent: true,
                date: { $gte: moment().subtract(3, "months").toDate() }
            },
            {
                projection: {
                    postId: false,
                    rawData: false,
                    authorUserId: false,
                    authorUsername: false,
                    authorUrl: false,
                    isRental: false,
                    isForRent: false
                }
            }
        );

        logger.debug("Data retrieved successfully by _id " + req.params.id);

        if (!data) {
            return res.status(NOT_FOUND).json({ err: "Not found" });
        }

        return res.json(data);
    }
);

export default router;
