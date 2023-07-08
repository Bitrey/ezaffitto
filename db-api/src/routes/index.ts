import { Router } from "express";

import bodyParser from "body-parser";

import rawDataRoutes from "./raw";
import parsedDataRoutes from "./parsed";

const router = Router();

router.use(bodyParser.json());

router.use("/raw", rawDataRoutes);
router.use("/parsed", parsedDataRoutes);

export default router;
