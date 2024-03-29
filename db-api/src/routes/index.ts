import { Router } from "express";

import bodyParser from "body-parser";

import rentalPostRoutes from "./rentalpost";
import geolocateRoutes from "./geolocate";
import panicRoutes from "./panic";
import pingRoute from "./ping";

const router = Router();

router.use(bodyParser.json());

router.use("/rentalpost", rentalPostRoutes);
router.use("/geolocate", geolocateRoutes);
router.use("/panic", panicRoutes);
router.use("/ping", pingRoute);

export default router;
