export interface EdgeGPTResponse {
    text: string;
    author: string;
    sources: { [key: string]: any }[];
    sources_text: string;
    suggestions: string[];
    messages_left: number;
}
