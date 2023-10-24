import { Router } from "express";
import rentalPostRoutes from "./rentalpost";
import pingRoute from "./ping";
import bodyParser from "body-parser";

const router = Router();

router.use(bodyParser.json());

router.use("/ping", pingRoute);
router.use("/rentalpost", rentalPostRoutes);

export default router;
