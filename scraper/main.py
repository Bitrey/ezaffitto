import sclib.fb as _fb
import os


from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
driver = webdriver.Remote("http://127.0.0.1:4444/wd/hub", DesiredCapabilities.CHROME)

def main():
  cookies = _fb.login(driver, user, pwd)

if __name__ == "__main__":
  main()
