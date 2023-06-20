#import sclib.fb as _fb
from selenium import webdriver
import time
import json
import os
from dotenv import load_dotenv
from facebook_scraper import get_posts
from kafka import KafkaProducer

load_dotenv()

user=os.environ.get("FB_UNAME")
pwd=os.environ.get("FB_PWD")  # your facebook password
kafka_server=os.environ.get("KAFKA_SERVER")
kafka_topic=os.environ.get('KAFKA_TOPIC')


DEFAULT_PAGES=os.environ.get("PAGE_NUMBER")
if DEFAULT_PAGES is None:
  DEFAULT_PAGES=5
# REMOTE_CHROME = "http://remote_chrome:4444"

def push_to_kafka(posts):
  producer = KafkaProducer(bootstrap_servers=kafka_server)
  for post in posts:
    producer.send(kafka_topic, json.dumps(post, default=str).encode('UTF-8'))
  pass
  

def main():
  time.sleep(10)
  posts = get_posts(group="955706091872293", credentials=(user, pwd), pages=DEFAULT_PAGES)
  push_to_kafka(posts)
if __name__ == "__main__":
  main()
