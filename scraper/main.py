import sclib.fb as _fb
from selenium import webdriver
import time
import os


user=os.environ.get("FB_UNAME")
pwd=os.environ.get("FB_PWD")  # your facebook password
REMOTE_CHROME = "http://remote_chrome:4444"


def main():
  #TODO REMOVE
  time.sleep(10)
  chrome_options = webdriver.ChromeOptions()
  driver = webdriver.Remote(REMOTE_CHROME, options=chrome_options)
  cookies = _fb.login(driver, user, pwd)

if __name__ == "__main__":
  main()
