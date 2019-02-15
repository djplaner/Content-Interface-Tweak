
# Purpose

Support a process by which content authors current ability of use Microsoft Word is leveraged to produce increasingly effective web-based content.

Originally designed for a University context using the Blackboard LMS in an attempt to help teaching staff produce increasingly effective learning material.

# How it works

1. Content author copies and pastes some Javascript/CSS to final destination Web page
> At this stage, the Javascript/CSS is specific for [Blackboard 9.1](https://www.blackboard.com/sites/sp6/index.html)
1. Content author creates content using Microsoft Word and a pre-defined set of styles.
1. When Word doc complete complete a customised version of [mammoth.js](https://github.com/mwilliamson/mammoth.js) is used to convert the Word doc to clean HTML.
1. Content author copies and pastes the HTML to the final desination Web page
> Steps 2-4 are repeated everytime a change is made to the content. These steps (without the Javascript/CSS) should work on any web-based platform. Entirely because Mammoth.js produces nice clean HTML.
1. When web page is viewed the Javascript/CSS modifies the clean HTML to improve appearance and functionality.

## How to use it with Blackboard LMS

The following instructions are specific for Blackboard 9.1 (the basics apply to other technologies) and focus on how to prepare a Content Area to host/display the HTML content.

### Add the HTML (your content)
1. Create a Content page in Blackboard
1. Add a Content Item (_Build Content_ > _Item_)
1. Give the new content item the title _Content Interface_
1. Copy and paste the HTML produced by Mammoth into the content editor.
> 1. Make sure the [Content Editor](https://blackboardhelp.usc.edu/course-content/adding-content-and-resources/using-the-content-editor/) is in advanced mode. 
> 1. Click on the _HTML_ button 
> 1. Paste the HTML into the window that pops up
> 1. Save the changes and return to the page

### Add the Javascript/CSS (to style)

1. Add another Content Item 
1. Give the new content item the title _Tweak_
1. Copy and paste the Javascript/CSS code in your version of the ??? file


