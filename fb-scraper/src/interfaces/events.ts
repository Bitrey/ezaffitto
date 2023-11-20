import { FbPost } from "./FbPost";
import { EzaffittoCity } from "./shared";

interface IScrapedData {
    fbData: FbPost;
    city: EzaffittoCity;
}
export interface ScrapedDataEventEmitter {
    on(event: "scrapedData", listener: (data: IScrapedData) => void): this;
    emit(event: "scrapedData", data: IScrapedData): boolean;
}
