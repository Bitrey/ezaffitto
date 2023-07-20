import axios, { AxiosError } from "axios";
import { envs } from "../config/envs";
import { logger } from "../shared/logger";
import { Errors } from "../interfaces/Error";

export async function geolocate(
    address: string,
    country = "IT",
    region = "Bologna"
): Promise<{ latitude: number; longitude: number } | null> {
    const params = {
        access_key: envs.GEOLOCATION_API_KEY,
        query: address,
        country: country,
        region,
        limit: 1,
        output: "json"
    };

    try {
        const { data } = await axios.get(
            "http://api.positionstack.com/v1/forward",
            { params }
        );

        if (data.data.results.length === 0) {
            logger.warn(`No results found for address ${address}`);
            return null;
        }

        const { latitude, longitude } = data.data.results[0];

        return { latitude, longitude };
    } catch (err) {
        logger.error("Error while geolocating address");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.GEOLOCATION_API_FAILED);
    }
}
