#
# convertLib.py
# - provide functions to convert HTML from Content Interface into
#   HTML ready to be converted into PDF


from bs4 import BeautifulSoup
import time
import re

import scrapeLib


#------------------------------------------
# ( html, videoUrl, activity) = handleVideoHtml( src )
# - convert iframe HTML into printable HTML and a link to video
# - activity indicates the type of activity to show

#https://web.microsoftstream.com/embed/video/a94b8d34-f1ac-4ee2-ae3a-c65cae59b666?autoplay=false&amp;showinfo=true" allowfullscreen style="border:none;"></iframe>

#https://web.microsoftstream.com/embed/video/ffd07790-d273-42af-8798-43b7138ff60e
#https://web.microsoftstream.com/video/ffd07790-d273-42af-8798-43b7138ff60e


def handleVideoHtml( src ):

    #-- which service
    servicePattern = '^https://([^/]*)'
    match = re.search(servicePattern,src)

    if (not match):
        return ( "<p>Couldn't find video URL</p>", "", "")

    service = match.group(1)

    if "forms.office.com" in service:
        return ( """
        <p>Please complete <a href="%s">this form/survey</a></p>
        """ % src, src, "Activity" )


    if "microsoftstream.com" in service:
        pattern = '^https://[^/]*/embed/video/([^/?]*)'    
        match = re.search(pattern,src)
        if match:
            videoId = match.group(1)
            videoUrl="https://web.microsoftstream.com/video/%s" % videoId
            return ( """
            <p>Video can be watched at <a href="%s">%s</a></p>
            """ % ( videoUrl, videoUrl ), videoUrl, "filmWatchingOptions" )
        return ("<p>Unable to identify URL for Microsoft Stream video.</p>","", "")

    if "youtube.com" in service: 
        pattern = '^https://[^/]*/embed/([^/]*)'    
        match = re.search(pattern, src) 
        if match: 
            videoId = match.group(1) 
            #thumbnail="https://i3.ytimg.com/vi/embed/%s/maxresdefault.jpg" % videoId 
            videoUrl="https://www.youtube.com/watch?v=%s" % videoId
    
            videoHtml = """
                    <p>Video can be watched at <a href="%s">%s</a></p> 
                    """ % (videoUrl, videoUrl)
            return (videoHtml, videoUrl, "filmWatchingOptions") 
        return ("<p>Unable to get YouTube video URL</p>", "", "")

    if "h5p.com" in service: 
        src = src.replace("/embed","")
        return ( """ 
        <p>Embedded H5P resource available fom <a href="%s">%s</a> 
        """ % (src,src),src, "Activity")

    return ( """
    <p>Embedded resource of unknown type available from <a href="%s">%s</a>
    """ % (src,src),"", "Activity")

# -------------------------------------------------
#html = processHtml(title,html)
# - manipulate the HTML to make it more appropriate for PDF
# - including replacing invisible title with title

def processHtml(title, html):
    externalUrls = []

    blackboardPattern = "^/webapps/blackboard"
    soup = BeautifulSoup(html,features="lxml")

    # -- remove the div.accordion-expand-holder element
    element = soup.select_one(".accordion-expand-holder")
    element.extract()

    # -- remove the Mark Reviewed button

    buttons = soup.select("button.bg-transparent")
    for button in buttons:
        button.extract()

    # -- remove the Mark Reviewed label in the accordions
    buttons = soup.select("span.ui-state-active")
    for button in buttons:
        button.extract()

    # extract links
    # - first generate a unique list of links
    urls = {}
    anchors = soup.select("a")
    for anchor in anchors:
        ## ignore the mark review links
        if anchor.has_attr('class') and 'gu-bb-review' in anchor['class']:
            continue
        ## ignore simple anchor links
        if not anchor.has_attr('href'):
            continue
        urls[anchor.attrs['href']] = anchor.text
        # modify blackboard /webapps links to add the BASEURL
        match = re.search(blackboardPattern, anchor['href'])
        if match:
            anchor['href'] = "%s%s" %(scrapeLib.BLACKBOARD_BASE_URL,anchor['href'])

    # -- now loop thru unique list and add to externalUrls
    for link in urls.keys():
        linkType = 'ExternalLink'

        match = re.search(blackboardPattern, link)
        if match:  # -- we have a lackboard link
            linkType= 'BlackboardLink' 
        item = {
            'TYPE': linkType,
            'URL': scrapeLib.BLACKBOARD_BASE_URL + link,
            'TITLE': urls[link]
        } 
        externalUrls.append(item)
    # -- handle the YouTube videos
    #  -- actually moving to embeds
    #iframes = soup.select("iframe")
    embeds = soup.select(".embed")

    #for iframe in iframes:
    for embed in embeds:
        #-- is there an iframe in the embed?
        iframe = embed.select("iframe")

        if (len(iframe)==0):
            continue

        #-- focus on the first (and only? iframe)
        iframe = iframe[0]

        if 'src' in iframe.attrs:
            src = iframe.attrs['src']
            (videoHtml,videoUrl,activity) = handleVideoHtml( src)

            if ( activity=="Activity"):
                videoActivityHtml = """
                <div class="activity">
                   <div class="activityImage"></div>
                %s
                </div>
                """ % videoHtml
            else: 
                videoActivityHtml = """
            <div class="filmWatchingOptions">
                <div class="filmWatchingOptionsImage"></div>
                <div class="instructions">
                  %s
                </div>
            </div>
            """ % videoHtml

            newVideoSoup = BeautifulSoup(videoActivityHtml,features="lxml")
            embed.replace_with(newVideoSoup)
            #iframe.replace_with(newVideoSoup)
  
            item = {
                'TYPE': 'Video',
                'URL': videoUrl
            } 
            externalUrls.append(item)
 
    # -- add the title
    element = soup.select_one(".invisible")
    element.string = title

    # -- insert the External URLS to the front of the PDF?
    videoListHTML = ""
    externalListHTML = ""
    blackboardListHTML= ""
    for url in externalUrls:
#        print("------ %s - %s" % (url['URL'], url['TYPE']))
        if url['TYPE'] == "Video":
            videoListHTML+= '<li> <a href="%s">%s</a> </li>' % (
                url['URL'], url['URL'] )
        if url['TYPE'] == "ExternalLink": 
            externalListHTML += '<li> <a href="%s">%s</a> </li>' % (
                url['URL'], url['TITLE'] )
        if url['TYPE'] == "BlackboardLink": 
            blackboardListHTML += '<li> <a href="%s">%s</a> </li>' % (
                url['URL'], url['TITLE'])
    
    externalUrlHTML = """ 
    <h1>Online Exclusive Materials</h1>
    <p>This document makes reference to the following online resources.</p>
"""

    if videoListHTML:
        externalUrlHTML += """
    <h2>Videos and other embedded content</h2>
    <ul> %s </ul>
    """ % videoListHTML

    if externalListHTML:
        externalUrlHTML += """
    <h3>External Links</h3>
    <ul> %s </ul>
    """ % externalListHTML

    if blackboardListHTML:
        externalUrlHTML += """
    <h3>Blackboard Links</h3>
    <ul> %s </ul>
    """ % blackboardListHTML

    externalSoup = BeautifulSoup(externalUrlHTML,features="lxml")
    soup.append(externalSoup) 
#    print(html)
#    element.insert_after(externalSoup)

    return soup.prettify()
