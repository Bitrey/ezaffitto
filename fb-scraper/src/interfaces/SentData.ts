import { FbPost } from "./FbPost";

export interface SentData {
    postId: string;
    rawMessage: string;
    scraperRawData: FbPost;
}
