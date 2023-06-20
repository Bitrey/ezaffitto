#import sclib.fb as _fb
from selenium import webdriver
import time
import json
import os
from dotenv import load_dotenv
from facebook_scraper import get_posts
from kafka import KafkaConsumer

load_dotenv()

kafka_server=os.environ.get("KAFKA_SERVER")
kafka_topic=os.environ.get('KAFKA_TOPIC')


DEFAULT_PAGES=os.environ.get("PAGE_NUMBER")
if DEFAULT_PAGES is None:
  DEFAULT_PAGES=5
# REMOTE_CHROME = "http://remote_chrome:4444"

  
def read_from_kafka():
  consumer = KafkaConsumer(kafka_topic, bootstrap_servers=kafka_server)
  while True:
    event = consumer.poll(5000)
    print(event.items())


def main():
  time.sleep(10)
  read_from_kafka()
  
if __name__ == "__main__":
  main()
