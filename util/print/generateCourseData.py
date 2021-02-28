#
# generateCourseData.py
# 1. Provide some course specific data
#    - Course name, Course ID
#    - URLs to scrape
#    - Base local folder for PDFs
# 2. Run to generate
#    - courseData.py - list of pages to scrape and where to put the PDFs
#    - link.json - list of ids to add shared links to the PDFs

from bs4 import BeautifulSoup
import re
import pprint

#from scrapeLib import setup,login,getHtml
import scrapeLib
import tmp

global DEFAULT_CSS
DEFAULT_CSS="./gu_study.css"
global COURSES

COURSES = {
    "CWR111_2211" :
    {
        'PDF_FOLDER' : "C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\",
        'PAGES' : 
        [
            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977537_1&mode=reset',
            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5841326_1&mode=reset'
        ]
    }
}

#-------------------------
# courseData = displayCourseData( courseId, links )
# - given courseId and a list of links
# - generate python array of hashes as a string

def displayCourseData( courseId, links):
    array = []

    count=1

    for link in links:
        name="{:02d}".format(count)
        entry = {
            "URL": "%s/%s"%(scrapeLib.BLAED_BASE_URL,link),
            "css": DEFAULT_CSS,
            "name": "%s%s\\%s.pdf"%(COURSES[courseId]["PDF_FOLDER"],courseId,name)
        }
        count+=1

        array.append(entry)

    return array

#-----------------------
# string = displayJavascript( courseId, links )
# - given collection of links return string with Javascript definitions
#   for PRINT_URLS 
# - hash 
#   - keyed on a string formed by "id" + course_id + content_id with _ replaced

def displayJavascript( courseId, links ):
    string = "// %s\n" % courseId

    coursePattern = re.compile("course_id=([0-9_]+)")
    contentPattern = re.compile("content_id=([0-9_]+)")

    for link in links:
        courseId=''
        contentId=''
        m = re.search(coursePattern, link)
        if m:
            courseId=m.group(1)
        m = re.search(contentPattern, link )
        if m:
            contentId=m.group(1)

        if courseId!="" and contentId!="":
            courseId=courseId.replace("_","")
            contentId=contentId.replace("_","")
            string = string + "'id%s%s': '%s/%s,'\n" % (courseId,contentId,scrapeLib.BLACKBOARD_BASE_URL,link)

    return string

#------------------------------
# urls = extractCardUrls(html)
# - extract a list of URls from given html for a Card Interface

def extractCardUrls( html):

    soup = BeautifulSoup(html,'html.parser')

    links = [a.get('href') for a in soup.find_all(class_="cardmainlink")]

    print("found %s links" % len(links))

    return links


#-------------------------
# generateCourseData

def generateCourseData():
    print("generate course data")
    browser = scrapeLib.setup()
    browser = scrapeLib.login( browser )

    pp = pprint.PrettyPrinter()

    for courseId in COURSES: 
        #-- get the HTML for the card interface
        print( "COURSE %s" %courseId)
        pdf = COURSES[courseId]["PDF_FOLDER"]
        print( "-- PDF folder %s" %pdf)

        courseLinks=[]

        pages = COURSES[courseId]["PAGES"]
        pp.pprint(pages)

        for page in COURSES[courseId]["PAGES"]:
            print("-- PAGE %s"%page)
            (title, content) = scrapeLib.getHtml(browser,page,False)
            links = extractCardUrls(content)
            pp.pprint(links)
            courseLinks.extend(links)
            print("-------------------")
            pp.pprint(courseLinks)

#        print(courseLinks)
        data = displayCourseData(courseId, courseLinks)
        pp.pprint(data)
        javascript = displayJavascript( courseId, courseLinks )
        print(javascript)

if __name__ =="__main__":
    print("Checking main")
    generateCourseData()