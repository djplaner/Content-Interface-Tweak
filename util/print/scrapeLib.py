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
global BLAED_BASE_URL
BLAED_BASE_URL="https://bblearn-blaed.griffith.edu.au"
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
    
    BROWSER.get(BLACKBOARD_BASE_URL) 

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
    print("------------------ getHTML for %s "%url)

    BROWSER.get(url) 
    time.sleep(5)

    if isContentInterface: 
        WebDriverWait(BROWSER, 20).until(EC.presence_of_element_located( 
            (By.XPATH, "//*[@class='gu_content_open' or @class='open']")))
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
    else: # currently hard coded to look for card interface before proceeding
        WebDriverWait(BROWSER, 20).until(EC.presence_of_element_located( 
            (By.CLASS_NAME, "cardmainlink")))
            #(By.ID, "content_listContainer")))
        # get the list of items in the Blackboard page if not ContentInterface
        content = BROWSER.find_element_by_id("content_listContainer").get_attribute('outerHTML')

    title = BROWSER.find_element_by_id("pageTitleText").get_attribute('innerText')

    #soup = BeautifulSoup(content,'lxml')
    soup = BeautifulSoup(content,'html.parser')
    content = soup.prettify().encode('cp1251',errors='ignore')
    return (title, content ) 


# -------------------------------------------------
# boolean = filterLink( linkElement, attr)
# - given a BS linkElement where the URL is in attr
# - return true if we should filter this link

def filterLink( linkElement, attr):
    print("-- testing filterLink %s" % attr)
    print(linkElement)
    print(type(linkElement))
    #-- if the attr isn't in the link
    if not linkElement.has_attr(attr):
        return True

    link = linkElement[attr]
    #-- base64 image
    if "data:image" in link:
        return True

    #-- blackboard url
    if re.match( "^/webapps/blackboard/", link):
        return True 
    if re.match( "^/webapps/assignment/", link):
        return True 

    #-- TODO check if we need to search for BlackboardContentLinks 
    #  shouldn't be necessary, they shoudl have been translated

    return False

# -------------------------------------------------
# extractLinks(html,courseUrl,course)
# - html - is html of page (GU_ContentInterface) specified by url for the course
# - return an array of hashes containing all of the links found in the HTML
#   including URL and course


def extractLinks(html,courseUrl,course):
    # the array of hashes that will be returned
    # { 'link': "the actual link"}
    # { 'link': "the actual link"}
    externalUrls = []

    soup = BeautifulSoup(html,features="lxml")
    # get the title for the page
    invisible = soup.find_all("div", class_="invisible")#.contents()
    title = invisible[0].text

    tags =  {'a':'href', 'img':'src', 
        'script':'src', 'link':'href' }

    for key,attr in iter(tags.items()): 
        #-- get all the links for the given tag
        links = soup.findAll(key)

        #-- add it to externalUrls
        for linkElement in links: 

            #-- filter the links that are considered
            if filterLink(linkElement,attr):
                continue
#            print(linkElement)
#            print("name %s" %linkElement.name) 
#            print("href %s" %linkElement[attr])
#            print(linkElement)

            newLink = {
                'course': course,
                'courseUrl': courseUrl,
                'link': linkElement[attr],
                'title': title
            }
            externalUrls.append(newLink)

    return externalUrls
