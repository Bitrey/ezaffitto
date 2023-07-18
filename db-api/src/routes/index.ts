import { Router } from "express";

import bodyParser from "body-parser";

import rawDataRoutes from "./raw";
import parsedDataRoutes from "./parsed";
import pingRoute from "./ping";

const router = Router();

router.use(bodyParser.json());

router.use("/raw", rawDataRoutes);
router.use("/parsed", parsedDataRoutes);
router.use("/ping", pingRoute);

export default router;
