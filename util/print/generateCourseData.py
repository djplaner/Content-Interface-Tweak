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

#from scrapeLib import setup,login,getHtml
import scrapeLib
import tmp

global COURSES

COURSES = {
    "CWR111_2210" :
    {
#        'PDF_FOLDER' : "fred", #"C:\\Users\s2986288\Griffith University\HLSSacademic - OUA\Study Guides & L@G\SP1\CWR110\Study Guide PDFs",
        'PAGES' : 
        [
            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977537_1&mode=reset',
            'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5841326_1&mode=reset'
        ]
    }
}

#-------------------------
# generateCourseData

def generateCourseData():
    print("generate course data")
    browser = scrapeLib.setup()
    browser = scrapeLib.login( browser )


    for course in COURSES: 
        #-- get the HTML for the card interface
        (title, content) = scrapeLib.getHtml(browser,
               'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977537_1&mode=reset',
               False)

        print("title is %s" %title)

        #-- get all the links in the card interface
        links = extractCardUrls(content)

        displayCourseData(links)
        displayJson(links)

#------------------------------
# urls = extractCardUrls(html)
# - extract a list of URls from given html for a Card Interface

def extractCardUrls( html):

    soup = BeautifulSoup(html,'html.parser')

    links = [a.get('href') for a in soup.find_all(class_="cardmainlink")]

    return links


if __name__ =="__main__":
    print("Checking main")
#    generateCourseData()

    links = extractCardUrls(tmp.html)
    displayCourseData(links)