# Why?

Creating content in Blackboard Learn is painful and produces ugly content that is not maintainable. No real support is provided for standard authoring functionality (e.g. version control, grammar checking, citation management etc.) No surprise then that most people upload documents (PDF, Word, PowerPoint etc.).

See [the Content Interface section](https://djon.es/blog/2019/08/08/exploring-knowledge-reuse-in-design-for-digital-learning-tweaks-h5p-constructive-templates-and-casa/#contentInterface) of [this paper](https://djon.es/blog/2019/08/08/exploring-knowledge-reuse-in-design-for-digital-learning-tweaks-h5p-constructive-templates-and-casa/) for more detail.

The [example Word document](Example.docx) provides more detailed instructions and background.

# What?

The Content Interface enables

1. Use of Microsoft Word to create content.
2. Conversion of Word into HTML
3. Javascript/CSS that transforms the HTML in various ways.

See [this blog post](https://djon.es/blog/2019/02/24/exploring-knowledge-reuse-in-design-for-digital-learning/) for more detail on why and how it works.

### Editing content in Word

![Word document](https://live.staticflickr.com/65535/50098693972_f0054d5904_c_d.jpg)

### Transformed HTML in Blackboard Learn

![to HTML in Blackboard](https://live.staticflickr.com/65535/50098686822_692a3634c3_c_d.jpg)

# How?


# How to use it with Blackboard Learn

The following instructions are specific for Blackboard Learn (the basics apply to other technologies) and focus on how to prepare a Content Area to host/display the HTML content.

## Step 1 - Add the Javascript/CSS 

The transformation of the HTML relies on some Javascript/CSS which needs to be included in the Blackboard Learn page. To do this:

1. Add a new Blackboard content item to the page 
1. Paste the content of [the tweak.html file](tweak.html) into the content item
   As this is HTML code, you will need to use the _HTML_ button before pasting.

## Step 2 - Add space for your content (HTML)

1. Add a Content Item (_Build Content_ > _Item_) give it the title _Content Interface_

## Step 3 - Create/update a Word document

A standard Word document will work. However, there are additional styles used to implement certain features.

The [example Word doc](https://djon.es/blog/wp-content/uploads/2020/07/output.gif) provides more detail on these styles and using Word. It can also be used as a template for your own Word documents.

## Step 4 - Transform your Word document into HTML and update Blackboard

1. Use this [version of Mammoth](https://djon.es/gu/mammoth.js/browser-demo/) to convert your Word document into HTML
   **NOTE:** The conversion occurs entirely in the browser. Your content is never placed onto another computer.
2. Copy the HTML produced by Mammoth into your clipboard.
3. Return to Blackboard Learn and paste the HTML into the_Content Interface_item you created above
   - Make sure the [Content Editor](https://blackboardhelp.usc.edu/course-content/adding-content-and-resources/using-the-content-editor/) is in advanced mode. 
   - Click on the _HTML_ button 
   - Paste the HTML into the window that pops up
   - Save the changes and return to the page

## Repeat steps 3 and 4 everytime you make a change

Never change the contenet in Blackboard.  Always make the change in Word first and then update Blackboard.

## Semi-automating the update process

If the Word document is shared (e.g. via OneDrive) then it is possible to semi-automate the update proces as illustrated in the following image.

https://djon.es/blog/wp-content/uploads/2020/07/output.gif


To do this:
1. Use OneDrive (or SharePoint) to create an appropriately shared link to the document
1. Create a web link item on the Blackboard Learn content page 
   Call it _Content Document_ and use the shared link to the document.
