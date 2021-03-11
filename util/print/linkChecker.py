#
# linkChecker.py
# - read a list of links from a CSV file
# - check if each one is accessible
# - generate a course based report of the links
#
# TODO
# 1. Need to filter URLs, so only do the one


import pandas as pd
from simple_settings import settings
from colorama import Fore
import urllib.request

import scrapeLib
import courseData

#--------------------------------------------
# links = getLinks
# - read in the links from the CSV file

def getLinks( courses=[]):
    # read the CSV file into data frame
    df = pd.read_csv(settings.LINKS_CSV_FILE)

    # filter only those in the courses array
    if len(courses)>0: 
        df = df[df['course'].isin(courses)]

    return df

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


#-----------------------------------------------------
# generateReport( course, checkedLinks)
# - given course id and array of details about checked links
# - generate a report (probably Word/HTML document?)
# - save to a file based on course id and a setting

def generateReport( course, links, checked):

    fileString = "<h1>%s</h1>"%course
    # filter link to focus on the course
    courseDF = links[ links['course'].str.match(course)]

    # Get a unique list of all the courseUrls for a cours
    pages = courseDF.courseUrl.unique()
    print("------------- pages")
    print(pages)

    # loop through each unique page
    for page in pages:
        # loop through all rows for the current page
        pageDF = links[ links['courseUrl']==page]
        title = pageDF.iloc[0,3]

        # add header for this unique page
        # -- get the title of the page?
        fileString += '<h2><a href="%s">%s</a></h2>'%(page,title)
        fileString += "<h3>Broken links</h3>"
        fileString+="<ol>"


        for index,row in pageDF.iterrows(): 
            # if the link is in checked and the outcome is in broken links
            if row['link'] in checked:
                if checked[row['link']] in scrapeLib.BROKEN_RESPONSE:
                    fileString += "<li> %s - <a href=\"%s\">%s</a> </li>"%(
                        checked[row['link']],row['link'],row['link'])

        fileString+="</ol>"

        #-- show the unknown links
        fileString += "<h3>Unknown links</h3>"
        fileString+="<ol>"
        for index,row in pageDF.iterrows(): 
            # if the link is in checked and the outcome is in broken links
            if row['link'] in checked:
                if checked[row['link']] == "exception":
                    fileString += "<li> %s - <a href=\"%s\">%s</a> </li>"%(
                        checked[row['link']],row['link'],row['link'])

        fileString+="</ol>"

    #with open("%s/%s.html"%(settings.LINKS_REPORTS,course), "w") as html_file: 
    with open("%s/%s.html"%(courseData.COURSE_REPORT_FOLDER[course],course), "w") as html_file: 
        print(fileString, file=html_file)
    html_file.close()



def runCheckLinks():

    courses = [
        "COM12_2211",
        "CWR110_2211",
        "CWR111_2211"
    ]

    links = getLinks( courses )
    print(links)

    checked = scrapeLib.checkLinks( links)

    print(checked)

    for course in courses:
        generateReport( course, links, checked)

if __name__ == "__main__":
    runCheckLinks()