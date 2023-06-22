export interface AppError {
    err: Errors;
}

export enum Errors {
    PARSER_NO_SUCCESSFUL_GPT_FETCH = "PARSER_NO_SUCCESSFUL_GPT_FETCH",
    PARSER_JSON_EXTRACTION_FAILED = "PARSER_JSON_EXTRACTION_FAILED",
    KAFKA_RECEIVED_INVALID_TOPIC = "KAFKA_RECEIVED_INVALID_TOPIC",
    KAFKA_RECEIVED_MALFORMED_JSON_DATA = "KAFKA_RECEIVED_MALFORMED_JSON_DATA",
    KAFKA_RECEIVED_EMPTY_PAYLOAD = "KAFKA_RECEIVED_EMPTY_PAYLOAD",
    KAFKA_RECEIVED_INVALID_RAW_DATA = "KAFKA_RECEIVED_INVALID_RAW_DATA",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
