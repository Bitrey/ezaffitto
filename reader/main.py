#import sclib.fb as _fb
import time
import json
import os
from dotenv import load_dotenv
from kafka import KafkaConsumer
import logging

load_dotenv()

kafka_server = os.environ.get("KAFKA_SERVER")
kafka_topic = os.environ.get('KAFKA_TOPIC')

DEFAULT_PAGES = os.environ.get("PAGE_NUMBER")
if DEFAULT_PAGES is None:
    DEFAULT_PAGES = 5
# REMOTE_CHROME = "http://remote_chrome:4444"


def read_from_kafka():
    consumer = KafkaConsumer(kafka_topic, bootstrap_servers=kafka_server)
    while True:
        event = consumer.poll(5000)
        # Stampa il POST
        for _, messages in event.items():
            for message in messages:
                message_value = json.loads(message.value)
                post = message_value.get("post")
                if post:
                    print(post)
                    logging.info(post)
        # print(event.items())
        print()


def main():
    # Configure logging
    logging.basicConfig(
        filename='logs/app.log',
        filemode='a',
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logging.getLogger().setLevel(logging.INFO)

    time.sleep(5)
    print("Listening on topic", kafka_topic)
    read_from_kafka()


if __name__ == "__main__":
    main()
