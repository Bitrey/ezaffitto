import { Channel, Message } from "amqplib";
import { RawData } from "./RawData";
import { RentalPost } from "./RentalPost";

export interface ParsedPost {
    postId: string;
    source: string;
    post: RentalPost;
}

export type ParsedPostWithoutSource = Omit<ParsedPost, "source">;

interface RawDataWithChannel extends RawData {
    ampq?: {
        channel: Channel;
        message: Message;
    };
}

export interface NotRentalParsedPost {
    postId: string;
    source: string;
}

export interface RawDataEventEmitter {
    on(event: "rawData", listener: (data: RawDataWithChannel) => void): this;
    emit(event: "rawData", data: RawDataWithChannel): boolean;
}

export interface ParsedDataEventEmitter {
    on(event: "parsedData", listener: (data: ParsedPost) => void): this;
    emit(event: "parsedData", data: ParsedPost): boolean;
}

export interface NotRentalsEventEmitter {
    on(event: "notRental", listener: (data: NotRentalParsedPost) => void): this;
    emit(event: "notRental", data: NotRentalParsedPost): boolean;
}
