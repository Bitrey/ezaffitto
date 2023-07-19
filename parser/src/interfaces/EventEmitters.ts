import { AppError } from "./Error";
import { RawData } from "./RawData";
import { RentalPost } from "./RentalPost";

export interface ParsedPost {
    postId: string;
    source: string;
    post: RentalPost;
}

export type ParsedPostWithoutSource = Omit<ParsedPost, "source">;

export interface RawDataEventEmitter {
    on(event: "rawData", listener: (data: RawData) => void): this;
    emit(event: "rawData", data: RawData): boolean;
}

export interface ParsedDataEventEmitter {
    on(event: "parsedData", listener: (data: ParsedPost) => void): this;
    emit(event: "parsedData", data: ParsedPost): boolean;
}

export interface ErrorEventEmitter {
    on(event: "error", listener: (data: AppError) => void): this;
    emit(event: "error", data: AppError): boolean;
}
