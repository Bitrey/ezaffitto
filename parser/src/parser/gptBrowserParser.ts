import { parentPort } from "worker_threads";
import { ChatGPTBrowserClient } from "@waylaidwanderer/chatgpt-api";

if (!parentPort) {
    throw new Error(
        "Parent port is not available, this script should be run as a worker thread"
    );
}

const clientOptions = {
    accessToken: "",
    cookies: ""
};

const chatGptClient = new ChatGPTBrowserClient(clientOptions);

async function handleTask(task: any) {
    switch (task.command) {
        case "sendMessage":
            const response = await chatGptClient.sendMessage(
                task.message,
                task.options
            );
            parentPort?.postMessage({ result: response });
            break;
        case "deleteConversation":
            await chatGptClient.deleteConversation(task.conversationId);
            break;
        default:
            throw new Error("Unknown command");
    }
}

parentPort.on("message", handleTask);
