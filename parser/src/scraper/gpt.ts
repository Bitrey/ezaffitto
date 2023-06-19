import {
    Configuration,
    ConfigurationParameters,
    CreateChatCompletionRequest,
    OpenAIApi
} from "openai";
import { envs } from "../config/envs";

class GPTScraper {
    protected openai: OpenAIApi;

    constructor(configuration: Configuration) {
        this.openai = new OpenAIApi(configuration);
    }

    createChatCompletion(requestParameters: CreateChatCompletionRequest) {
        return this.openai.createChatCompletion(requestParameters);
    }
}
