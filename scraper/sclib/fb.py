from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
import time

from selenium.webdriver.remote.webdriver import WebDriver




#TODO RETURN TYPE
def login(driver: WebDriver, user, pwd) -> None:
  driver.get("https://www.facebook.com")
  assert "Facebook" in driver.title
  elem = driver.find_element(By.ID, "email")
  elem.send_keys(user)
  elem=driver.find_element(By.ID, "pass")
  
  elem.send_keys(pwd)
  elem=driver.find_element(By.CSS_SELECTOR, "button[data-testid='royal_login_button']")
  elem.send_keys(Keys.RETURN)
  time.sleep(300)
  driver.quit()
  # TODO:
  # Return cookies
  
  
