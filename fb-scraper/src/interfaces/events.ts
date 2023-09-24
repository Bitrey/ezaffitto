import { FbPost } from "./FbPost";

export interface ScrapedDataEventEmitter {
    on(event: "scrapedData", listener: (data: FbPost) => void): this;
    emit(event: "scrapedData", data: FbPost): boolean;
}
