import { AxiosResponse } from "axios";

export interface ChatCompletionResponse extends AxiosResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string | null;
    }[];
}
