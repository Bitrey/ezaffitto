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

# OPTIONAL ENVS
to_mock_data: bool = os.environ.get('MOCK_DATA') 
no_login: bool = os.environ.get('NO_LOGIN') 


MOCK_DATA = [
#    {
#      "text":  """
#Affittasi posto in doppia zona Saragozza dall'1 Agosto. 
#Villino ristrutturato in Viale del Risorgimento vicino alla facoltà di ingegneria.
#Il contratto è un 4+4 e il costo ammonta a 270 euro mensili, utenze escluse.
#Ci sarà da prendere a proprio nome un'utenza fra gas e TARI.
#Per maggiori informazioni scrivetemi in privato.
#"""
#
#    },
    {
      "text":  """
Hello everyone!
Announcement is only for boys. Bedspace in a double room will be available for the month of July. One year contract is also available from August. The room is in Via San Donato. There are two bedrooms, a large terrace, one kitchen, two bathrooms and a large living room in the house. 15 mins away from Via Zamboni by bus. Price is 370€ everything included. If you are interested, please write me in private.
"""
    },
]



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
    while True:
        time.sleep(10)
        if to_mock_data:
            posts = MOCK_DATA
            push_to_kafka(posts)
            push_to_kafka(posts)
            push_to_kafka(posts)
        else:
            credentials=(user, pwd)
            if no_login:
                credentials = None
            posts = get_posts(group=group_id,
                        credentials=credentials,
                        pages=DEFAULT_PAGES)

            push_to_kafka(posts)
        time.sleep(60)


if __name__ == "__main__":
    main()
