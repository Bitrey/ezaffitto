import { logger } from "../shared/logger";
import { envs } from "./envs";

export const scraperTypes = envs.VALID_SCRAPER_TYPES.split(",");
logger.info("Using scraper types: " + scraperTypes);
