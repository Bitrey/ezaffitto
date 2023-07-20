import time
import json
from json import JSONEncoder
import os
from dotenv import load_dotenv
import logging
from datetime import date, datetime, timedelta
import atexit

import pika
from facebook_scraper import get_posts

load_dotenv()

user = os.environ.get("FB_UNAME")
pwd = os.environ.get("FB_PWD")  # your facebook password
groups_file = os.environ.get('GROUPS_FILE')

cookies_file = os.environ.get('COOKIES_FILE')

scraper_topic_prefix = "scraper.scraped."

rabbitmq_host = "rabbitmq"
rabbitmq_exchange = "topic_exchange"

rabbitmq_connection = None
rabbitmq_channel = None

start_timeout = 10
seconds_between_scrapes = 60

# if user is None or pwd is None or groups_file is None:
#     raise Exception("Missing env variables")

if cookies_file is None or groups_file is None:
    raise Exception("Missing env variables")

# OPTIONAL ENVS
to_mock_data: bool = os.environ.get('MOCK_DATA')
no_login: bool = os.environ.get('NO_LOGIN')
pages_to_scrape = int(os.environ.get("PAGE_NUMBER", 5))

mock_text = """
Hello everyone!
Announcement is only for boys. Bedspace in a double room will be available for the month of July. One year contract is also available from August. The room is in Via San Donato. There are two bedrooms, a large terrace, one kitchen, two bathrooms and a large living room in the house. 15 mins away from Via Zamboni by bus. Price is 370€ everything included. If you are interested, please write me in private.
"""

mock_data = [
    {
        "text": mock_text
    },
]


def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))


def connect_to_rabbitmq():
    global rabbitmq_connection, rabbitmq_channel

    rabbitmq_connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=rabbitmq_host))
    rabbitmq_channel = rabbitmq_connection.channel()
    rabbitmq_channel.exchange_declare(exchange=rabbitmq_exchange,
                                      exchange_type='topic',
                                      durable=True)


def publish_to_rabbitmq(source_type, post):
    data_dict = {
        "postId": post["post_id"],
        "rawMessage": post["original_text"] or post["text"],
        "scraperRawData": post,
    }

    message = json.dumps(data_dict, default=json_serial).encode('UTF-8')

    routing_key = scraper_topic_prefix + source_type

    rabbitmq_channel.basic_publish(exchange=rabbitmq_exchange,
                                   routing_key=routing_key,
                                   body=message)

    logging.info("Sent %r:%r" % (routing_key, f'{message[0:30]}...'))


def is_unix_timestamp_older_than_3_days(timestamp_str):
    try:
        timestamp = int(timestamp_str)
        timestamp_datetime = datetime.utcfromtimestamp(timestamp)
        current_datetime = datetime.utcnow()
        three_days_ago = current_datetime - timedelta(days=3)

        return timestamp_datetime < three_days_ago
    except ValueError:
        return False


def push_multiple_to_rabbitmq(source, posts):
    for post in posts:
        if is_unix_timestamp_older_than_3_days(post["timestamp"]):
            continue
        publish_to_rabbitmq(source, post)


# read and parse groups.json file, get only object keys
with open('groups.json') as json_file:
    groups = json.load(json_file)
    group_ids = list(groups.keys())


def scrape_fb(group_id):
    return get_posts(
        group=group_id,
        pages=pages_to_scrape,
        cookies=cookies_file,
    )


def main():
    # Configure logging
    logging.basicConfig(
        filename='logs/app.log',
        filemode='a',
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logging.getLogger().setLevel(logging.INFO)

    logging.info("Connecting to RabbitMQ")
    connect_to_rabbitmq()

    atexit.register(exit_handler)

    time.sleep(start_timeout)

    cur_group = 0

    while True:
        try:
            posts = mock_data if to_mock_data else scrape_fb(
                group_ids[cur_group])
            cur_group = (cur_group + 1) % len(group_ids)

            push_multiple_to_rabbitmq("facebook", posts)
        except Exception as e:
            logging.error(e)

        time.sleep(seconds_between_scrapes)


def exit_handler():
    if rabbitmq_connection is not None:
        logging.info("Closing RabbitMQ connection...")
        rabbitmq_connection.close()


if __name__ == "__main__":
    main()
