import sclib.fb as _fb
from selenium import webdriver
import time
import os
from dotenv import load_dotenv
from facebook_scraper import get_posts

load_dotenv()

user=os.environ.get("FB_UNAME")
pwd=os.environ.get("FB_PWD")  # your facebook password
REMOTE_CHROME = "http://remote_chrome:4444"


def main():
  posts = get_posts(group="955706091872293", credentials=(user, pwd))
  print(posts)
  for post in posts:
    print(post)

if __name__ == "__main__":
  main()
