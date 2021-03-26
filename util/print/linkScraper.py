#
# 1. Trawl thru the COURSES data structure
# 2. Extract all the links in GU_ContentInterface
# 3. Stick them into a csv - links.csv
# Ready for linkChecker to work on them
#

from simple_settings import settings
from weasyprint import HTML, CSS

import pandas as pd
import time
import re

import scrapeLib
import convertLib
import courseData
import testHtml

global COURSES
COURSES=courseData.COURSES












#----------------------------------------------
# scrapeLinks

def scrapeLinks():

    browser = scrapeLib.setup()
    browser = scrapeLib.login( browser )

    #courses = [ "CWR110_2211", "CWR111_2211", "COM12_2211", "1611QCM_3211"]
    courses = [ "1611QCM_3211"]

    gatheredLinks = []

    for course in courses: 
        for page in COURSES[course]: 
            if page['URL'] == '': 
                continue
            # -- get the HTML
            (title, html) = scrapeLib.getHtml(browser, page['URL'])

            if ( html==''):
                continue
#            html =TEST_HTML 

            print("working on %s" % page) 
#            print("Page type is %s " % type(page)) 
#            print("Name is %s" % page['name']) 
#            print("css is %s"%page['css']) 

            # -- post process it 
            links = scrapeLib.extractLinks(html,page['URL'],course)
            print(type(links))
            print(links)

            gatheredLinks = gatheredLinks + links

            print("======= gatheredLinks size is %s"%len(gatheredLinks))

#            break
#        break

    #-- convert to dataframe and then dump to CSV
    df = pd.DataFrame(gatheredLinks)
    print(df)
    df.to_csv(settings.LINKS_CSV_FILE,index=False)




if __name__=="__main__":
    scrapeLinks()