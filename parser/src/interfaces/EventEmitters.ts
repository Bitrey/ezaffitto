import { AppError } from "./Error";
import { RawData } from "./RawData";
import { RentalPost } from "./RentalPost";

export interface ParsedPost {
    scraperType: string;
    post: RentalPost;
}

export interface RawDataWithType {
    scraperType: string;
    rawData: RawData;
}

export interface RawDataEventEmitter {
    on(event: "rawData", listener: (data: RawDataWithType) => void): this;
    emit(event: "rawData", data: RawDataWithType): boolean;
}

export interface ParsedDataEventEmitter {
    on(event: "parsedData", listener: (data: ParsedPost) => void): this;
    emit(event: "parsedData", data: ParsedPost): boolean;
}

export interface ErrorEventEmitter {
    on(event: "error", listener: (data: AppError) => void): this;
    emit(event: "error", data: AppError): boolean;
}
