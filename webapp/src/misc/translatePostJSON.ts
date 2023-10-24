import { RentalPost, RentalPostJSONified } from "../interfaces/RentalPost";

export function translatePostJSON(post: RentalPost): RentalPostJSONified {
    return {
        ...post,
        date: new Date(post.date),
        createdAt: new Date(post.date),
        updatedAt: new Date(post.date)
    } as RentalPostJSONified;
}
