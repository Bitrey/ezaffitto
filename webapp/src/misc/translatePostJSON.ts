import {
    RentalPostJSONified,
    RentalPostJSONifiedRaw
} from "../interfaces/RentalPost";

export function translatePostJSON(
    post: RentalPostJSONifiedRaw
): RentalPostJSONified {
    const p = {
        ...post,
        date: new Date(post.date),
        createdAt: new Date(post.date),
        updatedAt: new Date(post.date),
        availabilityStartDate: post.availabilityStartDate
            ? new Date(post.availabilityStartDate)
            : undefined,
        availabilityEndDate: post.availabilityEndDate
            ? new Date(post.availabilityEndDate)
            : undefined
    } as RentalPostJSONified;
    if (!p.availabilityStartDate) {
        delete p.availabilityStartDate;
    }
    if (!p.availabilityEndDate) {
        delete p.availabilityEndDate;
    }
    return p;
}
