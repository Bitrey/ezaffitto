#import sclib.fb as _fb
from selenium import webdriver
import time
import json
from json import JSONEncoder
import datetime
import os
from dotenv import load_dotenv
from facebook_scraper import get_posts
from kafka import KafkaProducer

load_dotenv()

user = os.environ.get("FB_UNAME")
pwd = os.environ.get("FB_PWD")  # your facebook password
kafka_server = os.environ.get("KAFKA_SERVER")
kafka_topic = os.environ.get('KAFKA_TOPIC')
group_id = os.environ.get('FB_GROUP_ID')

# subclass JSONEncoder

if user is None or pwd is None or kafka_server is None or kafka_topic is None or group_id is None:
    raise Exception("Missing envs")


class DateTimeEncoder(JSONEncoder):
    # Override the default method
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()


DEFAULT_PAGES = os.environ.get("PAGE_NUMBER")
if DEFAULT_PAGES is None:
    DEFAULT_PAGES = 5
# REMOTE_CHROME = "http://remote_chrome:4444"


def push_to_kafka(posts):
    producer = KafkaProducer(bootstrap_servers=kafka_server)
    for post in posts:

        #from pprint import pprint
        #pprint(DateTimeEncoder().encode(post))
        #pprint(post)
        kafka_data = {"scraperRawData": post, "rawMessage": post["text"]}
        #pprint(kafka_data)
        print("[INFO] Sending to", kafka_topic)
        producer.send(
            kafka_topic,
            json.dumps(kafka_data, cls=DateTimeEncoder).encode('UTF-8'))
    pass


def main():
    time.sleep(10)
    posts = get_posts(group=group_id,
                      credentials=(user, pwd),
                      pages=DEFAULT_PAGES)
    push_to_kafka(posts)


if __name__ == "__main__":
    main()
