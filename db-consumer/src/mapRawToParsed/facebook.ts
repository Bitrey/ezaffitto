import moment from "moment";
import { ParsedData, PostMetadata, RentalPost } from "../interfaces/RentalPost";
import { geolocate } from "./geolocation";
import { logger } from "../shared/logger";
import { FbPost } from "../interfaces/FbPost";

export async function mapFBPostToFullDoc(
    postId: string,
    fb: FbPost,
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
        date: fb.date,
        images: fb.images || [],
        postId, // per sicurezza non usare quello di fb (non si sa mai)
        rawData: rawDataObjectId,
        source: "facebook",
        authorUrl: fb.authorUrl,
        latitude: coords?.latitude,
        authorUsername: fb.authorName,
        longitude: coords?.longitude,
        url: fb.postUrl
    };

    return {
        ...metadata,
        ...parsed
    };
}
