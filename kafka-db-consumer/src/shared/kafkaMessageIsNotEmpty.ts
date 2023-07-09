import { KafkaMessage } from "kafkajs";

export function kafkaMessageIsNotEmpty(
    message: KafkaMessage
): message is KafkaMessage & { value: Buffer } {
    return !!message.value;
}
