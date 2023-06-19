from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
import time

user=" "  # your fb email
pwd=" "  # your facebook password



#TODO RETURN TYPE
def login(driver: WebDriver, user, pwd) -> None:
  driver.get("https://www.facebook.com")
  assert "Facebook" in driver.title
  elem = driver.find_element_by_id("email")
  elem.send_keys(user)
  elem=driver.find_element_by_id("pass")
  
  elem.send_keys(pwd)
  elem=driver.find_element_by_id("loginbutton")
  elem.send_keys(Keys.RETURN)
  time.sleep(300)
  driver.quit()
  # TODO:
  # Return cookies
  
  
