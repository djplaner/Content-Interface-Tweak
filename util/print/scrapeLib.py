#
# scrapeLib.py
# - collection of service functions to login to and getHtml for Blackboard pages

from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


from simple_settings import settings


import time
import re
from bs4 import BeautifulSoup

global BLACKBOARD_BASE_URL
BLACKBOARD_BASE_URL="https://bblearn.griffith.edu.au"
global OPTS
OPTS=Options() 
#global BROWSER
global BINARY

def setup(): 
    print("---------------- set up")
    if hasattr( settings, "FIREFOX_BINARY"): 
        BINARY = FirefoxBinary() 
        BROWSER=Firefox(firefox_profile=settings.FIREFOX_PROFILE, firefox_binary=BINARY, 
            executable_path=settings.GECKO_DRIVER,options=OPTS) 
    else: 
        BROWSER=Firefox(firefox_profile=settings.FIREFOX_PROFILE, options=OPTS) 

    return BROWSER


#--------------------------
# login
# - start selenium and login to bblearn

def login(BROWSER):
    print("--------------- starting login")
    #opts.set_headless() 
    #assert opts.headless 
    
    BROWSER.get('https://bblearn-blaed.griffith.edu.au') 

    #-- login
    element = WebDriverWait(BROWSER,30).until(
        EC.presence_of_element_located((By.ID,"username")))

    ## login
    BROWSER.find_element_by_id("username").send_keys(settings.BB_USERNAME)
    BROWSER.find_element_by_id("password").send_keys(settings.BB_PASSWORD)
    BROWSER.find_element_by_class_name("login-button").click()

    time.sleep(20)

    #-- need to handle the cookie thing
    # - Maybe, if the profile is set up correctly, not needed
    try:
        element = WebDriverWait(BROWSER,10).until(EC.presence_of_element_located((By.ID,"agree_button")))
        BROWSER.find_element_by_id("agree_button").click()
    except TimeoutException:
        pass

    return BROWSER


#----------------------------------
# (title, html) = getHtml(url, isContentInterface=True)
# - given a bblearn URL, open the page, extract the title

def getHtml(BROWSER, url,isContentInterface=True ): 
    print("------------------ getHTML")

    BROWSER.get(url) 
    time.sleep(5)

    if isContentInterface: 
        # click expandAll 
        expand = BROWSER.find_elements_by_xpath("//*[@class='gu_content_open' or @class='open']") 

        if len(expand)>0: 
            expand[0].click() 
            #-- get the Content Interface content 
            content = BROWSER.find_element_by_id("GU_ContentInterface").get_attribute('outerHTML')
        else:
            print("ERROR - no expand all button found")
            return ("","")
        #-- get the page title
    else:
        # get the list of items in the Blackboard page if not ContentInterface
        content = BROWSER.find_element_by_id("content_listContainer").get_attribute('outerHTML')

    title = BROWSER.find_element_by_id("pageTitleText").get_attribute('innerText')

    soup = BeautifulSoup(content,'lxml')
    content = soup.prettify().encode('cp1251',errors='ignore')
    return (title, content ) 
