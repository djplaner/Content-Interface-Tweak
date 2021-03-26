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
from colorama import Fore
import urllib.request

import pandas as pd

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

global BROKEN_RESPONSE
BROKEN_RESPONSE = [400,404,403,408,409,501,502,503]


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
    title = "No title found - %s" % courseUrl
    if len(invisible)>0:
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


#------------------------------------------------
# boolean = badlySharedSharePointLink( link )
# - given a link, return true if it is a sharepoint link 
#   and hasn't be shared properly

#def badlySharedSharePointLink( link ): 
#    if "griffitheduau.sharepoint" not in url: 
#        return True

## base url
#https://griffitheduau.sharepoint.com/
## people with existing access (folder)
# :f:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/COM14/Week%20011?csf=1&web=1&e=MHMAfo
## people with existing access (file)
# /:w:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/COM14/Code%20of%20Conduct%20OUA-1.docx?d=wfc12a575123d4673a9549fda49189940&csf=1&web=1&e=ghec3L 
## direct link to file (open in word)
# /:w:/r/sites/HLSSacademic/_layouts/15/Doc.aspx?sourcedoc=%7BFC12A575-123D-4673-A954-9FDA49189940%7D&file=Code%20of%20Conduct%20OUA-1.docx&action=default&mobileredirect=true

## shared
## peole at Grifith with link
# /:w:/s/HLSSacademic/EXWlEvw9EnNGqVSf2kkYmUABq8gje80AwX5kztG6Mud8nA?e=IaPzam
    
#            print("%s"%url)
#            if "COM14" in url: 
#                print("DANGER %s"%url)

#------------------------------------------------
# checked = checkLinks( course, links)
# - given the course id and a data frame of all links
# - given a dict keyed on links and value is result

def checkLinks( links, course="all"):
    checked = {}
    courseDF = pd.DataFrame()

    #-- extract data frame for just this course
    if course =="all":
        courseDF = links
    else: 
        courseDF = links[ links['course'].str.match(course)]

    # return empty array if no links
#    if courseDF.shape[0]==0:
#        return checked

    print("Check frame with %s rows"%links.shape[0])
    count=0
    #-- check the links
    for idx,row in courseDF.iterrows(): 
        print("row %s link %s"%(count,row['link']))
        count+=1

        if row['link'] in checked:
            continue

        try: 
            req=urllib.request.Request(url=row['link'],
                    headers ={ 
                       "User-Agent" : "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.27 Safari/537.17" 
                    }) 
            #print("created request")
            resp=urllib.request.urlopen(req) 
            #print("made request")
            #-- check if it's a sharepoint link and if it's shared properly

#            if badlySharedSharePointLink( row['link']):
#                checked[row['link']] = "BadSharePoint" 
#                print (Fore.RED+"Badly shared SharePoint link "+row['link'])          
#            else: 
            checked[row['link']] = resp.status 
            #print("response is %s"%resp.status) 
            print (Fore.GREEN+"no problem in-->"+row['link']) 

            
        except Exception as e: 
            print("FRED " + str(e))

            if hasattr( e, 'code'): 
                print("code is %s" %e.code) 
                checked[row['link']] = e.code
                if e.code in BROKEN_RESPONSE: 
                    print (Fore.RED+str(e.code)+" --> "+row['link'])          
                else:
                    print( "What the fuck %s" %e.code )
            else: 
                print (Fore.YELLOW+"{} - {}".format(e,row['link'])) 
                checked[row['link']] = "exception"

    return checked
