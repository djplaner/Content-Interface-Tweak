#
# generatePDFs.py
# - Given some data about Blackboard pages,  for each page
#   - visit the page
#   - use weasyprint to convert to PDF
#   - save to OneDrive shared folder

from weasyprint import HTML, CSS

import scrapeLib
import convertLib
import courseData
import testHtml

global COURSES
COURSES=courseData.COURSES

#---------------------
# generatePDF
def generatePDF():
    browser = scrapeLib.setup()
    browser = scrapeLib.login( browser )

    for courseId in COURSES: 
        #-- get the HTML for the card interface
        print( "COURSE %s" %courseId)

        for page in COURSES[courseId]:
            if page['URL']=='' or page['name']=='':
                continue
            print("-- Going to get %s"%page)
            (title, content) = scrapeLib.getHtml(browser,page['URL'])

#            title ="Hello fred"
#            content = testHtml.TEST_HTML

            if content=='':
                continue

            html = convertLib.processHtml(title,content)

            HTML(string=html).write_pdf(
                stylesheets=[CSS(filename=page['css'])],
                target=page['name']
            )

if __name__ =="__main__":
    print("Checking main")
    generatePDF()