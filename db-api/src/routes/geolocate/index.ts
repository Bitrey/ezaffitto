import { Router } from "express";
import { query } from "express-validator";
import { validate } from "../../middlewares/expressValidator";
import { envs } from "../../config/envs";
import axios, { AxiosError } from "axios";
import { GeolocationRoot } from "../../interfaces/geolocation";
import { logger } from "../../shared/logger";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "http-status";
import { ReverseGeolocationRoot } from "../../interfaces/reverseGeolocation";

const router = Router();

router.get(
    "/forward",
    query("address").isString(),
    validate,
    async (req, res) => {
        // res.json({ address: req.query.address });
        const address = req.query.address as string;

        const params = {
            key: envs.GEOLOCATION_API_KEY,
            address: address
        };

        try {
            const axiosRes = await axios.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                { params }
            );
            const data: GeolocationRoot = axiosRes.data;

            if (data.results.length === 0) {
                logger.debug(
                    `Geolocation no results found for query ${address}`
                );
                return res
                    .status(NOT_FOUND)
                    .json({ err: "errors.noResultsFound" });
            }

            const { lat, lng } = data.results[0].geometry.location;
            logger.debug(
                `Geolocated query ${address} to lat ${lat} lng ${lng}`
            );

            return res.json({
                formattedAddress: data.results[0].formatted_address,
                latitude: lat,
                longitude: lng
            });
        } catch (err) {
            logger.error("Error while geolocating query");
            logger.error((err as AxiosError).response?.data || err);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .json({ err: "errors.geolocationFailed" });
        }
    }
);

router.get(
    "/reverse",
    query("lat").isNumeric(),
    query("lng").isNumeric(),
    validate,
    async (req, res) => {
        // res.json({ lat: req.query.lat, lng: req.query.lng });
        const lat = req.query.lat as string;
        const lng = req.query.lng as string;

        const params = {
            key: envs.GEOLOCATION_API_KEY,
            latlng: `${lat},${lng}`
        };

        try {
            const axiosRes = await axios.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                { params }
            );
            const data: ReverseGeolocationRoot = axiosRes.data;

            if (data.results.length === 0) {
                logger.debug(
                    `Reverse geolocation no results found for query ${lat},${lng}:`
                );
                logger.debug(data);
                return res
                    .status(NOT_FOUND)
                    .json({ err: "errors.noResultsFound" });
            }

            const { formatted_address } = data.results[0];
            logger.debug(
                `Geolocated query ${lat},${lng} to formatted address ${formatted_address}`
            );

            return res.json({
                formattedAddress: formatted_address,
                latitude: lat,
                longitude: lng
            });
        } catch (err) {
            logger.error("Error while reverse geolocating query");
            logger.error((err as AxiosError).response?.data || err);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .json({ err: "errors.geolocationFailed" });
        }
    }
);

export default router;
