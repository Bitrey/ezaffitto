export interface AppError {
    err: Errors;
}

export enum Errors {
    PARSER_NO_SUCCESSFUL_GPT_FETCH = "PARSER_NO_SUCCESSFUL_GPT_FETCH",
    PARSER_JSON_EXTRACTION_FAILED = "PARSER_JSON_EXTRACTION_FAILED",
    PARSER_GPT_ERROR = "PARSER_GPT_ERROR",
    PARSER_DATA_NOT_ADHERENT_TO_SCHEMA = "PARSER_DATA_NOT_ADHERENT_TO_SCHEMA",

    RABBITMQ_RECEIVED_NULL_MESSAGE = "RABBITMQ_RECEIVED_NULL_MESSAGE",
    RABBITMQ_RECEIVED_INVALID_SCRAPER_TYPE = "RABBITMQ_RECEIVED_INVALID_SCRAPER_TYPE",
    RABBITMQ_RECEIVED_MALFORMED_RAW_DATA = "RABBITMQ_RECEIVED_MALFORMED_RAW_DATA",
    RABBITMQ_RECEIVED_INVALID_RAW_DATA = "RABBITMQ_RECEIVED_INVALID_RAW_DATA",

    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
