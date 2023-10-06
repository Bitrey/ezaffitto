import { RentalPost } from "./RentalPost";

export interface RawText {
    text: string;
}

export interface ParserEventEmitter {
    on(event: "rawText", listener: (data: RawText) => void): this;
    emit(event: "rawText", data: RawText): boolean;

    on(event: "rentalPost", listener: (data: RentalPost) => void): this;
    emit(event: "rentalPost", data: RentalPost): boolean;
}
