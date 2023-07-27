import moment from "moment";
import { FacebookData } from "../interfaces/FacebookData";
import { ParsedData, PostMetadata, RentalPost } from "../interfaces/RentalPost";
import { geolocate } from "./geolocation";
import { logger } from "../shared/logger";

export async function mapFBPostToFullDoc(
    postId: string,
    fb: FacebookData,
    parsed: ParsedData,
    rawDataObjectId: string
): Promise<RentalPost> {
    let coords: Awaited<ReturnType<typeof geolocate>> = null;

    if (parsed.address) {
        try {
            coords = await geolocate(parsed.address);
            logger.info(
                `Fetched lat and lon for postId ${postId}: ${JSON.stringify(
                    coords
                )}`
            );
        } catch (err) {
            logger.error("Error while geolocating address");
            logger.error(err);
        }
    }

    const metadata: PostMetadata = {
        date: moment.unix(fb.timestamp).toDate(),
        images: fb.images,
        postId, // per sicurezza non usare quello di fb (non si sa mai)
        rawData: rawDataObjectId,
        source: "facebook",
        authorUrl: fb.user_url,
        latitude: coords?.latitude,
        authorUserId: fb.user_id,
        authorUsername: fb.username,
        longitude: coords?.longitude,
        url: fb.post_url
    };

    return {
        ...metadata,
        ...parsed
    };
}
