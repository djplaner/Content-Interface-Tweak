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
#    "CWR110_2211" :
#    {
#        'PDF_FOLDER' : "C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\",
#        'BASE_SHARED_URL': 'https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/{NAME}?csf=1&web=1&e=FnVoyC', 
#        'PAGES' : 
#        [
#            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977537_1&mode=reset',
#            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5841326_1&mode=reset'
#        ]
#    },
#    "CWR111_2211" :
#    {
#        'PDF_FOLDER' : "C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\",
#        'BASE_SHARED_URL': 'https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/{NAME}?csf=1&web=1&e=FnVoyC', 
#        'PAGES' : 
#        [
#            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977906_1&course_id=_90774_1',
#            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5841467_1&course_id=_90774_1&mode=reset'
#        ]
#    },
    "COM12_2211" :
    {
        'PDF_FOLDER' : "C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\",
        'BASE_SHARED_URL': 'https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/{NAME}?csf=1&web=1&e=FnVoyC', 
        'PAGES' : 
        [
          'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002720_1&course_id=_90697_1',
          'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5841236_1&course_id=_90697_1&mode=reset'  
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

    print("display string %s"%string)
    coursePattern = re.compile("course_id=([0-9_]+)")
    contentPattern = re.compile("content_id=([0-9_]+)")

    count=1
    for link in links:
        # Extract the id from course_id and content_id in URL
        cId=''
        contentId=''
        m = re.search(coursePattern, link)
        if m:
            cId=m.group(1)
        m = re.search(contentPattern, link )
        if m:
            contentId=m.group(1)

        if cId!="" and contentId!="":
            cId=cId.replace("_","")
            contentId=contentId.replace("_","")

            name="{:02d}.pdf".format(count)
            count+=1
            print("Course id is %s name is %s"%(courseId,name))
            sharedUrl = COURSES[courseId]['BASE_SHARED_URL'].replace("{NAME}", name)
            string = string + "'id%s%s': '%s',\n" % (cId,contentId,sharedUrl)

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