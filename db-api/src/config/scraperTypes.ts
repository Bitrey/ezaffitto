import { config } from ".";
import { logger } from "../shared/logger";

export type ScraperType = (typeof config.SCRAPER_TYPES)[number];

logger.info("Using scraper types: " + config.SCRAPER_TYPES);
