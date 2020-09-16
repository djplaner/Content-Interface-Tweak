
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */

// Default dates
var TERM = "3191", YEAR = 2019;

// Default reviewed/mark reviewed labels
var MARK_REVIEWED = "Mark Reviewed";
var REVIEWED = "Reviewed";

// Wrap arounds for various types of activity 
var READING = `<div class="readingImage"></div>`;
var ACTIVITY = `<div class="activityImage"></div>`;
var COMING_SOON = `<div class="comingSoonImage"></div>`;
var NOTE = `<div class="noteImage"></div>`;

var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
<button type="button" class="open">Expand all</button>
<button type="button" class="close">Collapse all</button>
</div>`;

var DEFAULT_CSS = "https://s3.amazonaws.com/filebucketdave/banner.js/gu_study.css";
// Used for documentation
var CARDS_CSS = "https://s3.amazonaws.com/filebucketdave/banner.js/cards.css";
var FONT_AWESOME_JS = "https://kit.fontawesome.com/3bd759c8f5.js";

// simple definition for using pure.css tables
// TODO need to replace this.
var TABLE_CLASS = 'table stripe-row-odd';

// Define way to insert a checkbox that can be clicked
var CHECKBOX = `<input type="checkbox" name="gu_dummy" />`;

// specify Bb links to ensure external links open in new window
var BLAED_LINK = 'bblearn-blaed.griffith.edu.au';
var LMS_LINK = 'bblearn.griffith.edu.au';

var PARAMS = {};

/************************** *
 * ITEM_LINK_PARAMETERS defines the parameters to be looked for as Content Items
 * all of which define links as their value
 * 
 * The key for each item is the expected title of the Blackboard item
 * - element 
 *   The paramsObj attribute name to point to the jQuery element. Used to
 *   access (and hide) the element if editing is turned off
 * - item 
 *   The paramsObject attribute name to contain the link
 */

var ITEM_LINK_PARAMETERS = {
    'Content Document': {
        'element': 'wordDocElement',
        'item': 'wordDoc'
    },
    'Film Watching Flow': {
        'element': 'filmWatchingOptionsElement',
        'item': 'filmWatchingOptionsFlowURL',
    },
    'cssURL': {
        'element': 'cssURLElement',
        'item': 'cssURL'
    }
};

/****************************************************************************/

/* Main function
 * - called from the tweak
 */

function contentInterface($) {

    // redefine contains so that it is case insensitive
    // Used to match the Blackboard headings
    $.expr[":"].contains = $.expr.createPseudo(function (arg) {
        return function (elem) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    /* define variables based on Bb page type */
    /* used to identify important components in html */
    var tweak_bb_active_url_pattern = "listContent.jsp";
    window.tweak_bb = {
        display_view: (location.href.indexOf(tweak_bb_active_url_pattern) > 0),
        page_id: "#content_listContainer",
        row_element: "li"
    };

    // Find the item in which the content is contained
    var contentInterface = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(".item h3").filter(':contains("Content Interface")').eq(0);
    // Find any Word Document link that's been added
    //    var wordDoc = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);

    // calculate the term etc
    calculateTerm();

    params = checkParams(contentInterface); //, wordDoc);
    // kludge to work with the jQuery each functions
    PARAMS = params;

    setUpEdit(contentInterface, params);

    // check parameters passed in
    // Hide the tweak if we're not editing
    if (location.href.indexOf("listContent.jsp") > 0) {
        $(".gutweak").parents("li").hide();
        // hide the title for content interface
        contentInterface.parents("div.item").hide();

        // hide all the items found for ITEM_LINK_PARAMETERS
        for (var paramKey in ITEM_LINK_PARAMETERS) {
            let elem = ITEM_LINK_PARAMETERS[paramKey].element;

            // if we found an item for this param, hide it
            if (elem in params) {
                jQuery(params[elem]).parents("li").hide();
            }
        }
    } else {
        // add the cards for documentation
        addCSS(CARDS_CSS);
        addJS(FONT_AWESOME_JS);
    }

    // do nothing if we couldn't find the contentInterface item
    if (contentInterface.length === 0) {
        return false;
    }

    // the if isn't required
    if ("cssURL" in params) {
        addCSS(params.cssURL);
    }

    if ("theme" in params) {
        changeJqueryTheme(params.theme);
    }

    // handle footnotes
    // - find each footnote reference and replace with a tooltipster element
    //   that incldues content from the actual footnote (minus some extra HTML)
    handleFootNotes();
    jQuery("div.filmWatchingOptions").each(handleFilmWatchingOptions);

    // handle the integration of any blackboard headings/items into the
    // content interface
    jQuery("h1.blackboard").each(handleBlackboardItem);
    jQuery("h2.blackboard").each(handleBlackboardItem);
    jQuery("span.blackboardContentLink").each(handleBlackboardContentLink);
    jQuery("span.blackboardMenuLink").each(handleBlackboardMenuLink);

    jQuery("span.universityDate").each(handleUniversityDate);

    // Add a <div> </div> around all the content following H1s
    jQuery('#GU_ContentInterface h1').each(function () {
        jQuery(this).nextUntil('h1').addBack().wrapAll('<div class="accordion_top"></div>');
        jQuery(this).nextUntil('h1').wrapAll('<div></div>');
    });
    // Add divs around the h2 headings, until h2 or h1
    jQuery('#GU_ContentInterface h2').each(function () {
        // console.log( "Heading text " + jQuery(this).html());
        jQuery(this).nextUntil('h1,h2').addBack().wrapAll('<div class="accordion"></div>');
        jQuery(this).nextUntil('h1,h2').wrapAll('<div></div>');
    });

    // Update all the readings and activities
    jQuery("div.activity").prepend(ACTIVITY);
    jQuery("div.reading").prepend(READING);
    jQuery("div.ael-note").prepend(NOTE);
    jQuery("div.comingSoon").prepend(COMING_SOON);
    //updateReadings(contentInterface);
    // Handle the blackboard items

    // Convert the videos - handled by embed now
    //doVideo();

    // convert the embed code
    var embeds = jQuery(".embed");
    embeds.each(function (idx) {
        var embed = jQuery(this).html();
        var decoded = jQuery("<div/>").html(embed).text();
        jQuery(this).html(decoded);

    });

    addExpandPrintButtons();

    // Find all the div.picture and add a <p> </p> around
    // text after the image
    jQuery("#GU_ContentInterface div.picture").each(function (idx) {
        jQuery(this).children('img').after('<br />');
        //console.log("Picture found " + jQuery(this).text()) ;
        //console.log("Picture found after text " + jQuery(afterImage));
    });
    jQuery("#GU_ContentInterface div.pictureRight").each(function (idx) {
        jQuery(this).children('img').after('<br />');
        //console.log("Picture found " + jQuery(this).text()) ;
        //console.log("Picture found after text " + jQuery(afterImage));
    });

    // convert all tables in the content to TABLE_CLASS
    // - TODO only add TABLE_CLASS if it doesn't have and div#tableHeading
    //   or otheers within it
    jQuery("#GU_ContentInterface table").addClass(TABLE_CLASS);

    // center contents of table cells that contain span class strongCentered
    jQuery("#GU_ContentInterface span.strongCentered").each(function (idx) {
        if (jQuery(this).parent().parent().is("td")) {
            jQuery(this).parent().parent().css('text-align', 'center');
        }
    });

    jQuery("#GU_ContentInterface span.centered").each(function (idx) {
        if (jQuery(this).parent().parent().is("td")) {
            jQuery(this).parent().parent().css('text-align', 'center');
        }
    });

    // check for any spans class checkbox and replace with checkbox
    jQuery("#GU_ContentInterface span.checkbox").each(function (idx) {
        //console.log(idx + " found checkbox " + jQuery(this).html());
        jQuery(this).html(CHECKBOX);
    });

    // convert all external links to open in another window
    // Also convert blaed links to normal bblean links
    jQuery("#GU_ContentInterface a").each(function (idx) {
        // check if it's a blackboard link
        // but ignore any with class gu-bb-review, these are added for
        // review status

        linkClass = jQuery(this).attr("class");
        if (linkClass === "gu-bb-review") {
            return;
        }

        var theLink = jQuery(this).attr('href');

        if (typeof theLink !== 'undefined') {
            // replace blaed links with normal links
            if (theLink.match(BLAED_LINK) !== null) {
                theLink = theLink.replace(BLAED_LINK, LMS_LINK);
                jQuery(this).attr('href', theLink);
            }
            // open external links in a new window i.e. links that don't
            // match the LMS or don't have a host portion at the start
            if (theLink.match(LMS_LINK) === null && theLink.match(/^\//) === null) {
                jQuery(this).attr('target', '_blank');
                // turn off the Blackboard onclick "stuff"
                jQuery(this).prop("onclick", null).off("click");
            }
        }
    });

    // Apply the jQuery accordion
    accordionDisabled = false;
    if (params.noAccordion === true) {
        // This actually greys out the accordion, rather than not
        // using it
        accordionDisabled = true;
        return false;
    }
    // check if there is actually an accordion, if not don't go any further

    // add and handle the accordion
    jQuery(".accordion,.accordion_top").accordion({
        collapsible: true,
        active: 1,
        disabled: accordionDisabled,
        navigation: true,
        //autoHeight:true
        heightStyle: 'content',
        activate: function (event, ui) {
            if (!$.isEmptyObject(ui.newHeader.offset())) {
                $('html:not(:animated), body:not(:animated)').animate({ scrollTop: ui.newHeader.offset().top }, 'slow');
                // send resize to ensure that h5p iframe appears correct
                // size
                window.dispatchEvent(new Event('resize'));
            }
        }
    });
    // TODO move this to a string and make it look prettier
    var icons = jQuery(".accordion").accordion("option", "icons");
    // define the click function for the expand all
    jQuery('.open').click(function () {
        event.preventDefault();
        jQuery('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
            'aria-selected': 'true',
            'tabindex': '0'
        });
        jQuery('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
        jQuery('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
            'aria-expanded': 'true',
            'aria-hidden': 'false'
        }).show();
        jQuery(this).attr("disabled", "disabled");
        jQuery('.close').removeAttr("disabled");
    });
    // define the click function for the collapse all
    jQuery('.close').click(function () {
        jQuery('.ui-accordion-header').removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all').attr({
            'aria-selected': 'false',
            'tabindex': '-1'
        });
        jQuery('.ui-accordion-header-icon').removeClass(icons.headerSelected).addClass(icons.header);
        jQuery('.ui-accordion-content').removeClass('ui-accordion-content-active').attr({
            'aria-expanded': 'false',
            'aria-hidden': 'true'
        }).hide();
        jQuery(this).attr("disabled", "disabled");
        jQuery('.open').removeAttr("disabled");
    });
    jQuery('.ui-accordion-header').click(function (e) {
        // if active is true, then we're opening an accordion
        // thus save which one it is
        let active = this.classList.contains("ui-state-active");

        if (active) {
            let hrefId = getHrefId(window.location.href);
            window.localStorage.setItem(hrefId, this.id);
        }

        // misc other stuff
        jQuery('.open').removeAttr("disabled");
        jQuery('.close').removeAttr("disabled");
    });


    // figure out which accordion to open
    // - by default it is the first 0
    // - if an integer is used as a link e.g. #1 or #5
    //   then open accordion matching that number
    // - if paramsObj.collapseAll == true - then none

    var start = window.location.hash.substring(1);
    var end;
    numAccordions = jQuery('.accordion_top').length;
    start = parseInt(start, 10) - 1;
    // if there wasn't a number to open, just open the first one
    if ((!Number.isInteger(start)) || (start > numAccordions - 1)) {
        start = 0;
        end = 1;
        if (params.scrollTo === true) {
            openWhereYouLeftOff();
        }

    } else {
        end = start + 1;
    }

    // want all expanded, figure out num accordions and set end appropriately
    if (params.expandAll === true) {
        start = 0;
        end = jQuery('#GU_ContentInterface h1').length;
    } else if (params.collapseAll === true) {
        start = 0;
        end = 0;
    } else if (params.expand > 0) {
        if (params.expand < jQuery('#GU_ContentInterface h1').length) {
            start = params.expand - 1;
            end = start + 1;
        } else {
            console.log("ERROR - expand value (" + params.expand + ") larger than number of heading 1s ");
        }
    }

    if (params.scrollTo === true) {
        jQuery('.accordion_top').slice(start, end).accordion("option", "active", 0);
    }

}


/************************************************************************
 * getHrefId( href )
 * Given a URL extract the blackboard course and content id and combine
 * them into an id (concatentate with a _)
 * Return that id.
 * Return href
 */

function getHrefId(href) {
    let courseId, contentId;
    // get the courseId
    m = href.match(/^.*course_id=(_[0-9_]+).*$/);
    if (!m) {
        return href;
    }
    courseId = m[1];
    // get the contentId
    m = href.match(/^.*content_id=(_[0-9_]+).*$/);
    if (!m) {
        return href;
    }
    contentId = m[1];

    return courseId + "/" + contentId;
}

/*********************************************************
 * openWhereYouLeftOff()
 * - check local storage, if we've been here before open the
 *   accordion that was open last time
 */

function openWhereYouLeftOff() {
    // Check to see if 
    let hrefId = getHrefId(window.location.href);
    let storageStart = window.localStorage.getItem(hrefId);
    if (typeof storageStart !== 'undefined') {
        // want to find the H1 or H2 that has the id in m[1]
        let heading = jQuery("h1#" + storageStart + ",h2#" + storageStart);
        // do we need to do something different for h2?
        // Maybe open the h1 element and then the h2 element?
        // but then we want to find the something or other that wraps it
        if (heading.length === 1) {
            let accord;
            let tagName = heading[0].tagName;

            if (tagName === 'H1') {
                accord = jQuery(heading[0]).parent();
                jQuery(accord).accordion("option", "active", 0);
            } else {
                // if H2, then open the H1 accordion 
                let p1 = jQuery(heading).parents("div.accordion_top"); // the top level DIV for h1
                jQuery(p1).accordion("option", "active", 0);
                // now open the H2 accordion
                let accordP = jQuery(heading).parent();
                jQuery(accordP).accordion("option", "active", 0);
            }
        }
    }
}

//********************************************* */
// handle footnotes
// - find each footnote reference and replace with a tooltipster element
//   that incldues content from the actual footnote (minus some extra HTML)

function handleFootNotes() {
    const footnote_re = /<a href="#footnote-ref-[0-9]*">.<\/a>/g;
    var footnotes = jQuery('#GU_ContentInterface a[id^="footnote-ref-"');
    var firstFootNote = '';

    footnotes.each(function () {
        // get the <sup> item wrapped around footnote
        var supItem = jQuery(this).parent();

        // get the id for the footnote content (at end of doc)
        //  footnote-ref-??  becomes
        //  footnote-??
        var footnoteId = jQuery(this).attr("id");
        var footnote = "li# " + footnoteId.replace('-ref', '');
        footnote = footnote.replace(' ', '');
        footnoteContent = jQuery(footnote).html();

        if (firstFootNote === '') {
            firstFootNote = footnote;
        }

        // need to remove the return link to the footnote in footnoteContent
        var footnoteContent = footnoteContent.replace(footnote_re, '');

        // need to remove the link on the footnote reference
        var refHtml = jQuery(this).html();
        jQuery(this).remove("a");
        jQuery(supItem).html(refHtml);

        // set the attributes for tooltipster to work
        supItem.attr('footNoteId', footnoteId);
        supItem.attr('class', 'ci-tooltip');
        supItem.attr('data-tooltip-content', footnoteContent);
    });

    // if there were footnotes, then
    if (footnotes.length) {
        // add a <h3>Footnotes</h3> heading just before the list of footnote content
        var footNoteList = jQuery(firstFootNote).parent();
        jQuery(footNoteList).before("<h1>Footnotes</h1>");
        //remove the return anchor TODO replace it with something that works
        var footNoteListHtml = jQuery(footNoteList).html().replace(footnote_re, '');

        jQuery(footNoteList).html(footNoteListHtml);

        // add tooltipster if there are footnotes
        jQuery("head").append(
            "<link id='tooltipstercss' href='https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/css/tooltipster.bundle.min.css' type='text/css' rel='stylesheet' />");
        jQuery("head").append(
            "<link id='tooltipstercssShadow' href='https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-shadow.min.css' type='text/css' rel='stylesheet' />");

        jQuery.getScript(
            //"https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.js",
            "https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.min.js",
            function () {
                docWidth = Math.floor(jQuery(document).width() / 2);
                jQuery('.ci-tooltip').tooltipster({
                    'maxWidth': docWidth,
                    theme: ['tooltipster-shadow', 'tooltipster-shadow-customized']
                });
            });
    }
}

/***************************************************
 * setUpEdit
 * - Set up the edit/update process
 * 
 * 
 */

var HOW_TO = "";
var UPDATE_HTML = () => `
<style>
#gu_nopadding{
    padding-left: 1em;
    margin-top: 0;
}
</style>
  <div class="mx-auto border-none box-content px-4 py-2">
    <div class="flex flex-wrap -mx-1 lg:-mx-4 p-0">

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h1 class="text-lg">
                      How to update the content
                    </h1>
                </header>
                <div class="p-2 md:p-4">
                ${HOW_TO}
                </div>
            </article>
        </div>

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h1 class="text-lg">
                            <i class="fa fa-exclamation-triangle text-red"></i>
                            No changes to this item
                    </h1>
                </header>
                <div class="p-2 md:p-4">
                    <p>Any changes to this item will stop the Content Interface from working.</p>
                </div>
            </article>
        </div>

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h1 class="text-lg">
                            <i class="fa fa-exclamation-triangle text-red"></i>
                            Do not hide this item
                    </h1>
                </header>
                <div class="p-2 md:p-4">
                   <p>If you make this item unavailable to students, the Content Interface will not work for them.</p>
                  <p>This item is only visible when <a href="https://elearn.southampton.ac.uk/blackboard/quickedit/">Edit Mode</a> is on. i.e. typically only visible to teaching staff.</p>
                </div>
            </article>
        </div>

    </div>
</div>

`;

var WORD_DOC_PRESENT = `
<ol>
  <li> Make any changes to the Content document, either <a id="gu_doc" target="_blank" href="http://griffith.edu.au">online</a> or directly.</li>
  <li>  Click the green button to <button style="background-color: #4CAF50; border: none; color: white; padding: 5px 5px; text-align: center; text-decoration: none; display: inline-block; border-radius: 12px" type="button" id="guUpdate">Update Content Interface</button>  </li>
  </ol>
`;

var WORD_DOC_NOT_PRESENT = `
<ol id="gu_nopadding">
<li>Edit the Word document.</li>
<li><a href="https://djon.es/gu/mammoth.js/browser-demo/" target="_blank" rel="noreferrer noopener">Convert the Word document into HTML</a>.</li>
<li>Paste the HTML into {EDIT_CONTENT_ITEM}. (Remember: to use <a href="http://www.bu.edu/tech/services/teaching/lms/blackboard/how-to/copypaste-into-blackboard-learn/">HTML code view</a></p>
</li>
</ol>
<p>You can also <a target="_blank" href="">semi-automate this process</a></p>
`;

var CONTENT_INTERFACE_NOT_PRESENT = `
<h3>Missing Content Interface item</h3>

<p>Unable to find a content item on this page with <strong>Content Interface</strong> in the title.</p>
<p>Such a content item is required before the Content Interface tweak can function.</p>
`;

var INSTRUCTIONS = `
<h3>How do I...</h3>

<div class="box-content mx-auto border-none h-auto py-0 px-4 m-0">
<div class="flex flex-wrap -mx-1 lg:-mx-4">
    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                        Get started
                </h1>
            </header>
            <div class="p-2 md:p-4">
                <p><a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578504_1">
                   Content Interface: what and why</a></p>
               <p>How to...</p>
               <ul id="gu_nopadding">
                  <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578507_1">
                        set it up in Blackboard</a> </li>
                  <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578508_1">
                        create and modify content</a> (an overview) </li>
              </ul>

            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                  Create <a href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1">
                    text content</a>
                </h1>
            </header>
            <div class="p-2 md:p-4">
    <ul id="gu_nopadding">
       <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#2">
            normal text content</a> 
       </li>
       <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#3">
            headings</a> 
       </li>
       <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#4">
            tables</a> 
       </li>
       <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#5">
            quotes</a> 
       </li>
       <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#6">
            reference lists</a> 
       </li>
       <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#7">
            footnotes</a> 
       </li>
    </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                 Create <a href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1">web content</a>
                </h1>
            </header>
            <div class="p-2 md:p-4">
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1#2">
                 Images
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1#3">
               Links
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1#4">
                 Embedding videos and more
            </a>
         </li>
         </li>
      </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                 Create University content
                </h1>
            </header>
            <div class="p-2 md:p-4">
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#2">
         Activities
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#3">
         Notes
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#4">
         Readings
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#5">
         Trimester (university) dates
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#6">
         Film Watching Options
            </a>
         </li>
      </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                  Use Blackboard items and features
                </h1>
            </header>
            <div class="p-2 md:p-4">
    How do you...   
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1#2">
           link to a Blackboard Menu item
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1&mode=reset#3">
           link to a Blackboard content item
            </a>
         </li>
         <li> 
            use <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1&mode=reset#4"> 
            review status</a>
         </li>
         <li> 
            use <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1&mode=reset#5"> 
            adaptive release</a>
         </li>
      </ul>
            </div>
        </article>
    </div>


    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                 Customise the interface
                </h1>
            </header>
            <div class="p-2 md:p-4">
    How do you customise...   
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?content_id=_5578515_1&course_id=_82534_1">
              which accordion opens first
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578516_1">
             the accordion theme
            </a>
         </li>
         <li> <a target="_blank" href="/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578519_1">
              appearance of the content
            </a>
         </li>

      </ul>
            </div>
        </article>
    </div>

</div>
</div>

</div> <!-- end gu_ci_instructions -->
    `;


var CHANGE_TEMPLATE = `
  
  <h3>Choosing a different template</h3>
  
  <p>Different templates are available to change the look and feel of the Content Interface.</p>
  <p>There is a two step process:</p>
  <ol>
    <li> Select one of the available style templates from the following list.</p>
<select name="styleSelector" id="styleSelector">
<option value="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">Base</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/start/jquery-ui.css">Start</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css" selected="selected">Smoothness</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/redmond/jquery-ui.css">Redmond</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/sunny/jquery-ui.css">Sunny</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/overcast/jquery-ui.css">Overcast</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/flick/jquery-ui.css">Flick</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/pepper-grinder/jquery-ui.css">Pepper Grinder</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css">UI Lightness</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/ui-darkness/jquery-ui.css">UI Darkness</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/le-frog/jquery-ui.css">Le Frog</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/eggplant/jquery-ui.css">Eggplant</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/dark-hive/jquery-ui.css">Dark Hive</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/cupertino/jquery-ui.css">Cupertino</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/blitzer/jquery-ui.css">Blitzer</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/south-street/jquery-ui.css">South Street</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/humanity/jquery-ui.css">Humanity</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/hot-sneaks/jquery-ui.css">Hot Sneaks</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/excite-bike/jquery-ui.css">Excite Bike</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/vader/jquery-ui.css">Vader</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/black-tie/jquery-ui.css">Black Tie</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/trontastic/jquery-ui.css">Trontastic</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/swanky-purse/jquery-ui.css">Swanky Purse</option>
</select>
  </li>
  
  <li> Modify the tweak code to use the selected template.
      <p>To do this you need to:</p>
      <ol>
        <li> Edit this item. </li>
        <li> Hit the HTML button on the Blackboard editor.</li>
        <li>Find the following line (bold added)
            <p><link rel="&lt;span class=" mceitemhiddenspellword="" />&lt;p&gt;&lt;link rel="stylesheet" id="gu_jqueryStyle" href="<strong>//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css</strong>" /&gt;&lt;/p&gt;</p>
        </li>
        <li>Replace the bold string with <strong><span id="gu_stylePath">https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css</span></strong></li>
        <li> Save the changes. </li>
</ol>

`;

function setUpEdit(ci, params) {
    //------------------------------------------------
    // Check to see if the Content Interface item contains details
    // about the Word document
    // - NO - show a message without update button
    // - YES - add the update button

    // does ci contain a path
    // -- currently implemented as a span with id gu_WordDocument that
    //    will contain a simple path (probably only works for me)
    // -- eventually should be a link that works for all with access


    current = window.location.href;
    var courseId;
    var contentId;

    m = current.match(/^.*course_id=(_[^&]*).*$/);
    if (m) {
        courseId = m[1];
    }

    // get the content id
    contentId = jQuery(ci).parent().attr("id");

    // if no content id then change display
    if (typeof contentId === 'undefined') {
        jQuery('#gu_update').html(CONTENT_INTERFACE_NOT_PRESENT);
        return;
    }

    // Has a link  to the word doc been shared
    let path = params.wordDoc;


    if (typeof path === 'undefined') {
        // Word document is not defined
        HOW_TO = WORD_DOC_NOT_PRESENT;
        let html = UPDATE_HTML() + INSTRUCTIONS;

        // add in link to edit the content item
        var editContent = 'into the <a href="https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem?content_id=' + contentId + '&course_id=' + courseId + '&dispatch=edit">Content Interface content item</a>';

        html = html.replace("{EDIT_CONTENT_ITEM}", editContent);

        // console.log("edit content item is " + editContent);
        jQuery('#gu_update').html(html);
        return;
    }

    //jQuery(".gu_docNotPresent").hide();
    HOW_TO = WORD_DOC_PRESENT;
    let updateHtml = UPDATE_HTML() + INSTRUCTIONS;

    if (jQuery('#gu_jqueryStyle').length) {
        updateHtml = updateHtml + CHANGE_TEMPLATE;
    }
    jQuery('#gu_update').html(updateHtml);

    jQuery("#gu_doc").attr("href", path);

    // encode path ready for going via URLs
    path = "u!" + btoa(path).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');


    jQuery("#styleSelector").on("change", function () {
        jQuery("#gu_jqueryStyle").attr("href", this.value);
        jQuery("#gu_stylePath").text(this.value);
    });

    //---------------------------------------------------
    // Set up the click event for the submit button
    // get the courseId




    jQuery("#guUpdate").click(function (event) {
        // if href currently includes blaed then add parameter

        var link = window.location.href;

        // Determine and tell Mammoth if we're using blaed blackboard
        var blaed = '';
        if (link.match(BLAED_LINK) !== null) {
            blaed = "&blaed=1";
        }

        // Determine and tell Mammoth if we're just want a particular title section
        var title = '';
        if (params.hasOwnProperty("titleNum")) {
            title = "&titleNum=" + params.titleNum;
        }
        if (params.hasOwnProperty("title")) {
            title = "&title=" + params.title;
        }
        window.location.href = "https://djon.es/gu/mammoth.js/browser-demo/oneDriveMammoth.html?course=" + courseId + blaed + title + "&content=" + contentId + "&path=" + path;
    });
}

/************************************************
 * checkParams
 * - given the content interface element check to see if anya
 *   parameters passed in 
 * - set object attributes and return it
 * - parameters come from both 
 *   - the title of the Content Interface content item
 *   - a Web Link content item that has Content Document in the title
 */

function checkParams(contentInterface) {
    var paramsObj = {};

    // define some default parameters
    paramsObj.expand = -1;
    paramsObj.scrollTo = true;
    paramsObj.cssURL = DEFAULT_CSS;

    // Check parameters in the Content Interface item title
    if (contentInterface.length > 0) {
        var contentInterfaceTitle = jQuery.trim(contentInterface.text());

        var m = contentInterfaceTitle.match(/content interface\s*([^<]+)/i);

        if (m) {
            //params = m[1].match(/\S+/g);

            params = parse_parameters(m[1]);

            if (params) {
                params.forEach(function (element) {
                    if (element.match(/nofirstscroll/i)) {
                        paramsObj.scrollTo = false;
                    } else if (element.match(/expandall/i)) {
                        paramsObj.expandAll = true;
                    } else if (element.match(/collapseall/i)) {
                        //console.log("Collapse all");
                        paramsObj.collapseAll = true;
                    } else if (element.match(/noaccordion/i)) {
                        paramsObj.noAccordion = true;
                    } else if (x = element.match(/css=([^ ]*)/)) {
                        paramsObj.cssURL = x[1];
                    } else if (x = element.match(/^reviewed=(.*)/ui)) {
                        REVIEWED = x[1];
                    } else if (x = element.match(/^markReviewed=(.*)/i)) {
                        MARK_REVIEWED = x[1];
                    } else {
                        x = element.match(/^([^=]*)=(.*)/);
                        if (x) {
                            paramsObj[x[1]] = x[2];
                        }
                    }
                });
            }
        }
    }

    //    console.log("---------------------");
    /*console.log(paramsObj);
    console.log("REVIEWED " + REVIEWED);
    console.log("MARK REVIEWED " + MARK_REVIEWED);*/


    /**********
     * check other content items for other parameters that are Content Items
     * - Only look for those defined in global ITEM_LINK_PARAMETERS 
     * - Looking for the link associated with item, what they are pointing to
     * - ITEM_PARAMS defines
     *   - key - is the expected title of the Blackboard item
     *   - element - define attribute name to add to paramsObj to contain jQuery element 
     *              to find in the Blackboard item
     *   - item - define pramsObj attribute name for the actual value 
     */

    for (var paramKey in ITEM_LINK_PARAMETERS) {
        const obj = ITEM_LINK_PARAMETERS[paramKey];

        // element is the h3 wrapped around the link
        element = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(
            ".item h3").filter(':contains("' + paramKey + '")').eq(0);
        // only if it's found
        if (element.length > 0) {
            paramsObj[obj.element] = element;
            paramsObj[obj.item] = jQuery(paramsObj[obj.element]).children("a").attr('href');
        }
    }

    return paramsObj;
}

/***************************************************
 * handleBlackboardItem( heading )
 * Given a single heading element as this
 * - find the matching Blackboard element
 * - find the content up until the next heading
 * - find any span.blackboardLink in the HTML and update the link
 * - if the item is hidden don't show the link and attempt to update
 *   the text to show (not currently available)
 * 
 * Footnotes - plan
 * - appear in a section as
 *     <sup><a href="#footnote-2" id="footnote-ref-2" target="_blank">[1]</a></sup>
 * - at the end of the file as
 *     <li id="footnote-3"> 
 *        <p>..footnote content. <a href="#footnote-ref-3" target="_blank">↑</a></p> 
 *     </li> 
 * Need to
 * - add the title to the sup and remove the link, but add the id to the sup
 * - if there is an ordered list with elements with id "footnote-2" e.g.  Add a small
 *   heading just before the foot notes
 */

function handleBlackboardItem() {

    var hidden_string = " (not currently available - will be hidden from students)";

    // get the title from the Blackboard Item Heading (2)
    title = jQuery(this).text();

    // define pseudo function to do comparison to get exact match, but
    // case insensitive
    jQuery.expr[':'].textEquals = jQuery.expr[':'].textEquals || jQuery.expr.createPseudo(function (arg) {
        return function (elem) {
            return elem.textContent.trim().localeCompare(arg, undefined, {
                sensitivity: 'base'
            }) === 0;
        };
    });

    /* Find the matching Blackboard element heading (h3) */
    // - ignore any headings that are within the Content Interface    
    var bbItem = jQuery("h3:textEquals(" + title + ")").filter(function () {
        parent = jQuery(this).parents('#GU_ContentInterface');
        return parent.length === 0;
    });

    if (bbItem.length === 0) {
        // no Blackboard content item found with matching name
        // either not present, slight difference in the name (look out special chars)
        // or adaptive release is hiding it from students

        if (window.tweak_bb.display_view) {
            // if edit off, remove the heading and its section disappear
            let nextHeading = jQuery(this).nextUntil(this.tagName);
            jQuery(this).remove();
            jQuery(nextHeading).remove();
        } else {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);

            // add the hidden_string to the link
            jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each(function () {
                linkText = jQuery(this).text();
                jQuery(this).text(linkText + hidden_string);
            });
        }
    } else if (bbItem.length > 1) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if (bbItem.length === 1) {

        // check if need to add Review Status
        reviewLink = getReviewStatusContent(bbItem);
        //console.log("title " + title + " review link is " + reviewLink);
        if (typeof reviewLink !== "undefined") {
            //-- update the title
            addReviewLink(this, reviewLink);

            //-- add the button to the content
            // - need to find content body

        }

        // get the link
        var link = jQuery(bbItem).children("a").attr('href');

        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
        if (link == null) {
            // Assume it's a TurnitIn and look for "View Assignment" link
            // Have to go up to the parent and onto the next div
            link = jQuery(bbItem).parent().next().children(".vtbegenerated").children("a");
            var text = link.text();
            if (text === 'View Assignment') {
                // we've found a Safe Assignment link
                link = link.attr('href');
            }
        }

        // check to see if the item is actually hidden
        hidden = jQuery(bbItem).parent().next().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        loc = location.href.indexOf("listContent.jsp");
        if (hidden.length === 1) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each(function () {
                linkText = jQuery(this).text();
                jQuery(this).text(linkText + hidden_string);
            });
            return true;
        }

        // Hide the bbitem li
        if (location.href.indexOf("listContent.jsp") > 0) {
            //console.log(bbItem);
            //console.log(jQuery(bbItem).parent().parent());
            jQuery(bbItem).parent().parent().hide();
        }
        // wrap any span class="blackboardLink" with a link
        var string = '<a href="' + link + '"></a>';
        // Try to replace just the Blackboard links for the current heading
        jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each(function () {
            jQuery(this).wrapAll(string);
        });


    }

}


/***************************************************
 * handleBlackboardContentLink( element )
 * Given a <span class="blackboardContentLink"> item
 * - find parent link and extract the href
 * - find the content item link on this page that matches the href
 * - if found - replace the href with the contentItem link
 * - if not found remove the link and maybe do a javascript popup
 */

function handleBlackboardContentLink() {
    var hidden_string = " (not currently available)";
    var inner = false; // indicates whether the link is insider or outer

    // get the title from the Blackboard Item Heading (2)
    // This should be getting the parent of the spane, which is a link
    // Not heading 2.
    title = jQuery(this).parent().attr('href');

    if (typeof title === 'undefined') {
        title = jQuery(this).find("a").first().attr('href');
        inner = true;
    }
    if (typeof title !== 'undefined') {
        title = title.replace(/%20/g, " ");
        // also need to remove 
    }
    // define pseudo function to do comparison to get exact match, but
    // case insensitive
    jQuery.expr[':'].textEquals = jQuery.expr[':'].textEquals || jQuery.expr.createPseudo(function (arg) {
        return function (elem) {
            let trimmed = elem.textContent.trim();
            return elem.textContent.trim().localeCompare(arg, undefined, {
                sensitivity: 'base'
            }) === 0;
        };
    });

    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find("h3:textEquals(" + title + ")");

    if (bbItem.length === 0) {
        // not found, so add hidden_string
        spanText = jQuery(this).text();
        jQuery(this).text(spanText + hidden_string);
    } else if (bbItem.length > 1) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if (bbItem.length === 1) {
        // get the link
        var link = jQuery(bbItem).children("a").attr('href');


        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
        if (link == null) {
            // Assume it's a TurnitIn and look for "View Assignment" link
            // Have to go up to the parent and onto the next div
            link = jQuery(bbItem).parent().next().children(".vtbegenerated").children("a");
            var text = link.text();
            if (text === 'View Assignment') {
                // we've found a Safe Assignment link
                link = link.attr('href');
            }
        }

        // check to see if the item is actually hidden
        hidden = jQuery(bbItem).parent().next().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        loc = location.href.indexOf("listContent.jsp");
        if (hidden.length === 1) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            return true;
        } else if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }

        if (!inner) {
            // the parent element was a link, replace the href with link
            jQuery(this).parent().attr('href', link);
            // Kludge - occasionally Blackboard adds an onclick
            // handler for links
            jQuery(this).parent().attr('onclick', '');
        } else {
            // the link was an element inside the this
            // - remove the internal links
            jQuery(this).find("a").each(function () {
                let link = jQuery(this);
                link.after(link.text());
                link.remove();
            });
            // - wrap with a single link
            jQuery(this).wrapInner("<a href='" + link + "'></a>");
        }
    }
}

/***************************************************
 * handleBlackboardMenuLink( element )
 * Given a <span class="blackboardMenuLink"> item
 * - find parent link and extract the href
 * - find the menu item link on this page that matches the href
 * - if found - replace the href with the contentItem link
 * - if not found remove the link and maybe do a javascript popup
 */

function handleBlackboardMenuLink() {
    var hidden_string = " (not currently available)";
    var duplicate_menu_string = " (more than 1 menu item with same name) ";

    // the title is the value of the link associated with the item
    // Either parent or child
    var linkParent = true;
    title = jQuery(this).parent().attr('href');
    if (typeof title === 'undefined') {
        linkParent = false;
        title = jQuery(this).children("a").first().attr('href');
    }

    if (typeof title !== 'undefined') {
        title = title.replace(/%20/g, " ");
    }

    /* Find the course menu link that matches */
    var bbItem = jQuery("#courseMenuPalette_contents > li > a > span[title='" + title + "']");
    // how many did we find?
    if (bbItem.length === 0) {
        // not found, so add hidden_string
        spanText = jQuery(this).text();
        jQuery(this).text(spanText + hidden_string);
    } else if (bbItem.length > 1) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
        spanText = jQuery(this).text();
        jQuery(this).text(spanText + duplicate_menu_string);
    } else if (bbItem.length === 1) {
        // get the link from the menu item
        var link = jQuery(bbItem).parent().attr('href');
        // check to see if the course menu item is actually hidden
        hidden = jQuery(bbItem).next().attr("class");
        if (hidden === "cmLink-hidden") {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            return true;
        }

        // change the link, depending on if we've a parent or child
        if (linkParent) {
            jQuery(this).parent().attr('href', link);
        } else {
            jQuery(this).children("a").first().attr('href', link);
        }


    }

}


//----------------------------------------------------------------
// addReviewLink
// - given the jQuery element for the heading of an accordion (item).
// - and the reviewLink taken from a matching Blackboard item
// - Modify the title of the accordion item
// - Modify the content

function addReviewLink(item, reviewLink) {

    linkText = jQuery(item).text();

    // Add text to the heading
    //var MARK_REVIEWED = "Mark Reviewed"
    //var REVIEWED = "Reviewed";

    var reviewHeadingTemplate = '';
    if (reviewLink.match(/markUnreviewed/)) {

        reviewHeadingTemplate = `
      <span style="float:right" class="ui-state-disabled ui-corner-all">{TEXT}</span>
      `;
        reviewHeadingTemplate = reviewHeadingTemplate.replace('{TEXT}', REVIEWED);
    } else {
        reviewHeadingTemplate = `
          <span style="float:right" class="ui-state-active ui-corner-all">{TEXT}</span>
          `;
        reviewHeadingTemplate = reviewHeadingTemplate.replace('{TEXT}', MARK_REVIEWED);
    }
    jQuery(item).html(linkText + reviewHeadingTemplate);

    // change the body"
    content = jQuery(item).next();

    reviewBodyTemplate = '';

    if (reviewLink.match(/markUnreviewed/)) {
        reviewBodyTemplate = `
          <!--<div class="p-4 absolute pin-l" style="float:right">-->
 <div class="p-4" style="margin:auto; width:100%; text-align:right">
     <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
                     <span class="font-bold rounded-full px-2 py-1 bg-green text-white">&#10003; {TEXT}</span>&nbsp;</button></a>
 </div>
 `;
        reviewBodyTemplate = reviewBodyTemplate.replace('{TEXT}', REVIEWED);
    } else {

        reviewBodyTemplate = `
 <div class="p-4" style="margin:auto; width:100%; text-align:right"> 
      <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
      <span class="font-bold rounded-full px-2 py-1 bg-yellow text-black">&#x26a0;</span>&nbsp; {TEXT}</button></a>
 </div>
         `;
        reviewBodyTemplate = reviewBodyTemplate.replace('{TEXT}', MARK_REVIEWED);
    }
    reviewBodyTemplate = reviewBodyTemplate.replace('{LINK}', reviewLink);
    // insert the reviewed button before the first item after the heading
    jQuery(content).before(reviewBodyTemplate);

}
//-----------------------------------------------------------------
// getReviewStatusContent
// - given the h3 item (header) from Bb Item, check to see if the
//   parent div contains a review status element (anchor with class
//   button-5)
// - if not return NULL
// - if there is one return the link (which indicates with it's
//   mark reviewed, or reviewed)

function getReviewStatusContent(header) {
    // get the details div for this header that should contain the
    // mark reviewed link
    var details = jQuery(header).parent().parent().find("div.details");
    //console.log(details);

    // check to see if it has the anchor with class button-5
    review = jQuery(details).find("a.button-5");

    if (review.length === 0) {
        return undefined;
    } else {
        return jQuery(review).attr("href");
    }
}

/*********************************************************************
 * Replaces commonly-used Windows 1252 encoded chars that do not exist 
 * in ASCII or ISO-8859-1 with ISO-8859-1 cognates.
 * https://www.andornot.com/blog/post/Replace-MS-Word-special-characters-in-javascript-and-C.aspx
 */

function replaceWordChars(text) {

    var s = text;
    // smart single quotes and apostrophe
    s = s.replace(/[\u2018\u2019\u201A]/g, "\'");
    // smart double quotes
    s = s.replace(/[\u201C\u201D\u201E]/g, "\"");
    // ellipsis
    s = s.replace(/\u2026/g, "...");
    // dashes
    s = s.replace(/[\u2013\u2014]/g, "-");
    // circumflex
    s = s.replace(/\u02C6/g, "^");
    // open angle bracket
    s = s.replace(/\u2039/g, "<");
    // close angle bracket
    s = s.replace(/\u203A/g, ">");
    // spaces
    s = s.replace(/[\u02DC\u00A0]/g, " ");

    return s;
}

/**
 * Final all the embedded video styles and embed them
 * NOT WORKING
 */

function doVideo() {
    console.log(" Started videos");

    var videos = jQuery("div.video");
    console.log(" Got " + videos.length + " videos");

    if (videos.length === 0) {
        return false;
    }

    videos.each(function (idx) {
        var text = jQuery(this).text();
        console.log(idx + " -- " + text);

        var matches = text.match(/x/);
        var id = matches[1], width = '640', height = '480';

        console.log('Match 0 ' + matches[0] + " 1 " + matches[1]);
        text = '<div class="youtube-article">' +
            '<iframe class="dt-youtube" width="' + width +
            '" height="' + height + '" src="https://www.youtube.com/embed/' +
            id + '" frameborder="0" allowfullscreen></iframe></div>';

        console.log("Ending with " + text);
        jQuery(this).html(text);
    });


}


//*** Experiements to see if I can open all by function call **

function openAll() {
    console.log("Open ALL ");
    jQuery('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
        'aria-selected': 'true',
        'tabindex': '0'
    });
    jQuery('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
    jQuery('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
        'aria-expanded': 'true',
        'aria-hidden': 'false'
    }).show();
    jQuery(this).attr("disabled", "disabled");
    jQuery('.close').removeAttr("disabled");
}

//---------------------------------------------------------------------
// Given a string of parameters use some Stack Overflow provided
// regular expression magic to split it up into its component parts

function parse_parameters(cmdline) {
    //    var re_next_arg = /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
    var re_next_arg = /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
    var next_arg = ['', '', cmdline];
    var args = [];
    while (next_arg = re_next_arg.exec(next_arg[2])) {
        var quoted_arg = next_arg[1];
        var unquoted_arg = "";
        while (quoted_arg.length > 0) {
            if (/^"/.test(quoted_arg)) {
                let quoted_part = /^"((?:\\.|[^"])*)"(.*)$/.exec(quoted_arg);
                unquoted_arg += quoted_part[1].replace(/\\(.)/g, "$1");
                quoted_arg = quoted_part[2];
            } else if (/^'/.test(quoted_arg)) {
                let quoted_part = /^'([^']*)'(.*)$/.exec(quoted_arg);
                unquoted_arg += quoted_part[1];
                quoted_arg = quoted_part[2];
            } else if (/^\\/.test(quoted_arg)) {
                unquoted_arg += quoted_arg[1];
                quoted_arg = quoted_arg.substring(2);
            } else {
                unquoted_arg += quoted_arg[0];
                quoted_arg = quoted_arg.substring(1);
            }
        }
        args[args.length] = unquoted_arg;
    }
    return args;
}

/*****************************************************************
 * handleUniversityDate( this )
 * - given a span with a university date in the form
 *         _day_ Week _num_
 *   e.g.   Wednesday Week 5
 * - update the element to add the actual date based on the
 *   trimester/study period associated with the course site
 *   e.g.    Wednesday Week 5 (25th April 2020)
 */

function handleUniversityDate() {
    dateText = jQuery(this).text();

    // extract the day and week
    // Wednesday Week 5 becomes
    // - day = Wednesday
    // - week = 5
    // and convert it to a date string
    //  date = March 12, 2019
    var day = '', week = '', date = '';
    m = dateText.match(
        /.*\b(((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?))\b[,]*[ ]*week *\b([0-9]*)/i);
    if (m) {
        day = m[1];
        week = m[m.length - 1];
        date = getTermDate(week, day);
    } else {
        // couldn't match the date, finish up
        return false;
    }

    // update the HTML item
    dateText = dateText + " (" + date + ")";
    jQuery(this).html(dateText);
}

//*********************
// getTermDate( week, day )
// - given a week and a day of Griffith semester return actual
//   date for matching that study period
// - weeks start on Monday

function getTermDate(week, dayOfWeek = 'Monday') {

    dayOfWeek = dayOfWeek.toLowerCase();
    var start;

    // if the week is not within the term return empty string
    if (typeof TERM_DATES[TERM][week] === 'undefined') {
        return "";
    }

    // else calculate the date and generate usable string
    start = TERM_DATES[TERM][week].start;
    var d = new Date(start);

    // if dayOfWeek is not Monday, add some days to the start of the week
    if (dayOfWeek !== 'monday') {
        var dayToNum = { 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6 };
        if (dayOfWeek in dayToNum) {
            d.setDate(d.getDate() + dayToNum[dayOfWeek.toLowerCase()]);
        }
    }
    // generate string from date with given options
    const options = { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' };
    dateString = d.toLocaleDateString(undefined, options);

    return dateString;
}

var TERM_DATES = {
    // OUA 2020 Study Period 1
    "2201": {
        "0": { "start": "2020-02-24", "stop": "2020-03-01" },
        "1": { "start": "2020-03-02", "stop": "2020-03-08" },
        "2": { "start": "2020-03-09", "stop": "2020-03-15" },
        "3": { "start": "2020-03-16", "stCop": "2020-03-22" },
        "4": { "start": "2020-03-23", "stop": "2020-03-29" },
        "5": { "start": "2020-03-30", "stop": "2020-04-05" },
        "6": { "start": "2020-04-06", "stop": "2020-04-12" },
        "7": { "start": "2020-04-13", "stop": "2020-04-19" },
        "8": { "start": "2020-04-20", "stop": "2020-04-26" },
        "9": { "start": "2020-04-27", "stop": "2020-05-03" },
        "10": { "start": "2020-05-04", "stop": "2020-05-10" },
        "11": { "start": "2020-05-11", "stop": "2020-05-17" },
        "12": { "start": "2020-05-18", "stop": "2020-05-24" },
        "13": { "start": "2020-05-25", "stop": "2020-05-31" },
        "14": { "start": "2020-06-01", "stop": "2020-06-05" },
        /* End of study period 4 */
        "exam": { "start": "2020-06-01", "stop": "2020-06-05" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 2
    "2203": {
        "0": { "start": "2020-05-25", "stop": "2020-05-31" },
        "1": { "start": "2020-06-01", "stop": "2020-06-07" },
        "2": { "start": "2020-06-08", "stop": "2020-06-14" },
        "3": { "start": "2020-06-15", "stop": "2020-06-21" },
        "4": { "start": "2020-06-22", "stop": "2020-06-28" },
        "5": { "start": "2020-06-29", "stop": "2020-07-05" },
        "6": { "start": "2020-07-06", "stop": "2020-07-12" },
        "7": { "start": "2020-07-13", "stop": "2020-07-19" },
        "8": { "start": "2020-07-20", "stop": "2020-07-26" },
        "9": { "start": "2020-07-27", "stop": "2020-08-02" },
        "10": { "start": "2020-08-03", "stop": "2020-08-09" },
        "11": { "start": "2020-08-10", "stop": "2020-05-17" },
        "12": { "start": "2020-08-17", "stop": "2020-05-24" },
        "13": { "start": "2020-08-24", "stop": "2020-05-31" },
        "14": { "start": "2020-08-31", "stop": "2020-09-06" },
        /* End of study period 4 */
        "exam": { "start": "2020-08-31", "stop": "2020-09-04" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 3
    "2205": {
        "0": { "start": "2020-08-24", "stop": "2020-09-30" },
        "1": { "start": "2020-08-31", "stop": "2020-09-06" },
        "2": { "start": "2020-09-07", "stop": "2020-09-13" },
        "3": { "start": "2020-09-14", "stop": "2020-09-20" },
        "4": { "start": "2020-09-21", "stop": "2020-09-27" },
        "5": { "start": "2020-09-28", "stop": "2020-10-04" },
        "6": { "start": "2020-10-05", "stop": "2020-10-11" },
        "7": { "start": "2020-10-12", "stop": "2020-10-19" },
        "8": { "start": "2020-10-19", "stop": "2020-10-25" },
        "9": { "start": "2020-10-26", "stop": "2020-11-01" },
        "10": { "start": "2020-11-02", "stop": "2020-11-08" },
        "11": { "start": "2020-11-09", "stop": "2020-11-15" },
        "12": { "start": "2020-11-16", "stop": "2020-11-22" },
        "13": { "start": "2020-11-23", "stop": "2020-11-29" },
        "14": { "start": "2020-11-30", "stop": "2020-12-06" },
        "15": { "start": "2020-12-07", "stop": "2020-12-13" },
        /* End of study period 4 */
        "exam": { "start": "2020-12-07", "stop": "2020-12-13" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 4
    "2207": {
        "0": { "start": "2020-11-30", "stop": "2020-12-06" },
        "1": { "start": "2020-12-07", "stop": "2020-12-13" },
        "2": { "start": "2020-12-14", "stop": "2020-12-20" },
        "3": { "start": "2020-12-21", "stop": "2020-12-27" },
        "4": { "start": "2020-12-28", "stop": "2021-01-03" },
        "5": { "start": "2021-01-04", "stop": "2021-01-10" },
        "6": { "start": "2021-01-11", "stop": "2021-01-17" },
        "7": { "start": "2021-01-18", "stop": "2021-01-24" },
        "8": { "start": "2021-01-25", "stop": "2021-01-31" },
        "9": { "start": "2021-02-01", "stop": "2021-02-07" },
        "10": { "start": "2021-02-08", "stop": "2021-02-14" },
        "11": { "start": "2021-02-15", "stop": "2021-02-21" },
        "12": { "start": "2021-02-22", "stop": "2021-02-28" },
        "13": { "start": "2021-03-01", "stop": "2021-03-07" },
        "14": { "start": "2021-03-08", "stop": "2021-03-14" },
        /* End of study period 4 */
        "exam": { "start": "2021-03-08", "stop": "2021-03-14" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // Griffith 2020 Trimester 2
    "3205": {
        "0": { "start": "2020-07-06", "stop": "2020-07-12" },
        "1": { "start": "2020-07-13", "stop": "2020-07-19" },
        "2": { "start": "2020-07-20", "stop": "2020-08-26" },
        "3": { "start": "2020-07-27", "stop": "2020-08-02" },
        "4": { "start": "2020-08-03", "stop": "2020-08-16" },
        "5": { "start": "2020-08-17", "stop": "2020-08-23" },
        "6": { "start": "2020-08-24", "stop": "2020-08-30" },
        "7": { "start": "2020-08-31", "stop": "2020-09-06" },
        "8": { "start": "2020-09-07", "stop": "2020-09-13" },
        "9": { "start": "2020-09-14", "stop": "2020-09-20" },
        "10": { "start": "2020-09-21", "stop": "2020-09-27" },
        "11": { "start": "2020-09-28", "stop": "2020-10-04" },
        "12": { "start": "2020-10-05", "stop": "2020-10-11" },
        "13": { "start": "2020-10-12", "stop": "2020-10-18" },
        "14": { "start": "2020-10-19", "stop": "2020-10-25" },
        "15": { "start": "2020-10-27", "stop": "2020-11-01" },
        "exam": { "start": "2020-10-12", "stop": "2020-10-18" }
    },
    // Griffith 2020 Trimester 1
    "3201": {
        "0": { "start": "2020-02-17", "stop": "2020-02-23" },
        "1": { "start": "2020-02-24", "stop": "2020-03-01" },
        "2": { "start": "2020-03-02", "stop": "2020-03-08" },
        "3": { "start": "2020-03-09", "stop": "2020-03-15" },
        "4": { "start": "2020-03-16", "stop": "2020-03-22" },
        "5": { "start": "2020-03-23", "stop": "2020-03-29" },
        "6": { "start": "2020-03-30", "stop": "2020-04-05" },
        "7": { "start": "2020-04-13", "stop": "2020-04-19" },
        "8": { "start": "2020-04-20", "stop": "2020-04-26" },
        "9": { "start": "2020-04-27", "stop": "2020-05-03" },
        "10": { "start": "2020-05-04", "stop": "2020-05-10" },
        "11": { "start": "2020-05-11", "stop": "2020-05-17" },
        "12": { "start": "2020-05-18", "stop": "2020-05-24" },
        "13": { "start": "2020-05-25", "stop": "2020-05-31" },
        "exam": { "start": "2020-06-01", "stop": "2020-06-07" }
    },
    // Griffith 2019 Trimester 3
    "3198": {
        "0": { "start": "2019-10-21", "stop": "2019-10-27" },
        "1": { "start": "2019-10-28", "stop": "2019-11-03" },
        "2": { "start": "2019-11-04", "stop": "2019-11-10" },
        "3": { "start": "2019-11-11", "stop": "2019-11-17" },
        "4": { "start": "2019-11-18", "stop": "2019-11-24" },
        "5": { "start": "2019-11-25", "stop": "2019-12-1" },
        "6": { "start": "2019-12-02", "stop": "2019-12-08" },
        "7": { "start": "2019-12-09", "stop": "2019-12-15" },
        "8": { "start": "2019-12-16", "stop": "2019-12-22" },
        "9": { "start": "2020-01-06", "stop": "2020-01-12" },
        "10": { "start": "2020-01-13", "stop": "2020-01-19" },
        "11": { "start": "2020-01-20", "stop": "2020-01-26" },
        "12": { "start": "2020-01-27", "stop": "2020-02-02" },
        "13": { "start": "2020-02-03", "stop": "2020-02-09" },
        "exam": { "start": "2020-02-06", "stop": "2020-02-15" }
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA Study Period 4 2019
    "2197": {
        "0": { "start": "2019-11-18", "stop": "2019-11-24" },
        "1": { "start": "2019-11-25", "stop": "2019-12-01" },
        "2": { "start": "2019-12-02", "stop": "2019-12-08" },
        "3": { "start": "2019-12-09", "stop": "2019-12-15" },
        "4": { "start": "2019-12-16", "stop": "2019-12-22" },
        "5": { "start": "2019-12-23", "stop": "2019-09-29" },
        "6": { "start": "2019-12-30", "stop": "2020-01-05" },
        "7": { "start": "2020-01-06", "stop": "2020-01-12" },
        "8": { "start": "2020-01-13", "stop": "2020-01-19" },
        "9": { "start": "2020-01-20", "stop": "2020-01-26" },
        "10": { "start": "2020-01-27", "stop": "2020-02-02" },
        "11": { "start": "2020-02-03", "stop": "2020-02-09" },
        "12": { "start": "2020-02-10", "stop": "2020-02-16" },
        "13": { "start": "2019-02-17", "stop": "2020-02-23" },
        /* End of study period 4 */
        "14": { "start": "2020-02-24", "stop": "2020-03-01" },
        "15": { "start": "2020-03-02", "stop": "2020-03-08" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA Study Period 3 2019
    "2195": {
        "0": { "start": "2019-08-19", "stop": "2019-09-25" },
        "1": { "start": "2019-08-26", "stop": "2019-09-01" },
        "2": { "start": "2019-09-02", "stop": "2019-09-18" },
        "3": { "start": "2019-09-09", "stop": "2019-09-15" },
        "4": { "start": "2019-09-16", "stop": "2019-09-22" },
        "5": { "start": "2019-09-23", "stop": "2019-09-29" },
        "6": { "start": "2019-09-30", "stop": "2019-10-06" },
        "7": { "start": "2019-10-07", "stop": "2019-10-13" },
        "8": { "start": "2019-10-14", "stop": "2019-08-20" },
        "9": { "start": "2019-10-21", "stop": "2019-10-27" },
        "10": { "start": "2019-10-28", "stop": "2019-11-03" },
        "11": { "start": "2019-11-04", "stop": "2019-11-10" },
        "12": { "start": "2019-11-11", "stop": "2019-11-17" },
        "13": { "start": "2019-11-18", "stop": "2019-11-24" },
        /* End of study period 3 */
        "14": { "start": "2019-11-25", "stop": "2019-12-01" },
        "15": { "start": "2019-10-07", "stop": "2019-10-13" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // Griffith 2019 Trimester 2
    "3195": {
        "0": { "start": "2019-07-01", "stop": "2019-07-07" },
        "1": { "start": "2019-07-08", "stop": "2019-07-14" },
        "2": { "start": "2019-07-15", "stop": "2019-07-21" },
        "3": { "start": "2019-07-22", "stop": "2019-07-28" },
        "4": { "start": "2019-07-29", "stop": "2019-08-04" },
        "5": { "start": "2019-08-05", "stop": "2019-08-11" },
        "6": { "start": "2019-08-19", "stop": "2019-08-25" },
        "7": { "start": "2019-08-26", "stop": "2019-09-01" },
        "8": { "start": "2019-09-02", "stop": "2019-09-08" },
        "9": { "start": "2019-09-09", "stop": "2019-09-15" },
        "10": { "start": "2019-09-16", "stop": "2019-09-22" },
        "11": { "start": "2019-09-23", "stop": "2019-09-29" },
        "12": { "start": "2019-09-30", "stop": "2019-10-06" },
        "13": { "start": "2019-10-07", "stop": "2019-10-13" },
        "14": { "start": "2019-10-14", "stop": "2019-10-20" },
        "15": { "start": "2019-10-21", "stop": "2019-10-27" },
        "exam": { "start": "2019-10-10", "stop": "2019-10-19" }
    },
    "3191": {
        "0": { "start": "2019-02-18", "stop": "2019-02-24" },
        "1": { "start": "2019-02-25", "stop": "2019-03-03" },
        "2": { "start": "2019-03-04", "stop": "2019-03-10" },
        "3": { "start": "2019-03-11", "stop": "2019-03-17" },
        "4": { "start": "2019-03-18", "stop": "2019-03-24" },
        "5": { "start": "2019-03-25", "stop": "2019-03-31" },
        "6": { "start": "2019-04-01", "stop": "2019-04-07" },
        "7": { "start": "2019-04-08", "stop": "2019-04-14" },
        "8": { "start": "2019-04-22", "stop": "2019-04-28" },
        "9": { "start": "2019-04-29", "stop": "2019-05-05" },
        "10": { "start": "2019-05-06", "stop": "2019-05-12" },
        "11": { "start": "2019-05-13", "stop": "2019-05-19" },
        "12": { "start": "2019-05-20", "stop": "2019-05-26" },
        "13": { "start": "2019-05-27", "stop": "2019-06-02" },
        "14": { "start": "2019-06-03", "stop": "2019-06-09" },
        "15": { "start": "2019-06-10", "stop": "2019-06-17" },
        "exam": { "start": "2019-05-30", "stop": "2019-06-08" }
    }

};

/*********************************************************************
 * calculateTerm()
 * - check the location and other bits of Blackboard to calculate
 *   the trimester etc
 */

function calculateTerm() {
    // get the right bit of the Blackboard breadcrumbs
    courseTitle = jQuery("#courseMenu_link").attr('title') ||
        "Collapse COM14 Creative and Professional Writing (COM14_3205_OT)";

    // get the course id which will be in brackets
    m = courseTitle.match(/^.*\((.+)\)/);

    // we found a course Id, get the STRM value
    if (m) {
        id = m[1];
        // break the course Id up into its components
        // This is the RE for COMM10 - OUA course?
        breakIdRe = new RegExp('^([A-Z]+[0-9]+)_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$');
        m = id.match(breakIdRe);

        // found an actual course site (rather than org site)	    
        if (m) {
            TERM = m[2];

            // set the year
            mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
            if (mm) {
                YEAR = 20 + mm[1];
            } else {
                YEAR = 2019;
            }
        } else {
            // check for a normal GU course
            breakIdRe = new RegExp('^([0-9]+[A-Z]+)_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$');
            // Following is broken

            m = id.match(breakIdRe);

            // found an actual course site (rather than org site)	    
            if (m) {
                TERM = m[2];
                // set the year
                mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
                if (mm) {
                    YEAR = 20 + mm[1];
                } else {
                    YEAR = 2019;
                }
            } else {
                breakIdRe = new RegExp('^([0-9]+[A-Z]+)_([0-9][0-9][0-9][0-9])$');

                m = id.match(breakIdRe);

                // found an actual course site (rather than org site)	    
                if (m) {
                    TERM = m[2];
                    // set the year
                    mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
                    if (mm) {
                        YEAR = 20 + mm[1];
                    } else {
                        YEAR = 2019;
                    }
                }
            }
        }
    }
}

/*************************************************************
 * addCSS( url )
 * - given the URL for a CSS file add it to the document
 * https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
 * (and other places)
 */

function addCSS(urlString) {
    let head = document.getElementsByTagName('head')[0];

    let style = document.createElement('link');
    style.href = urlString;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
}

/*************************************************************
 * addJS( url )
 * - given the URL for a JS file add it to the document
 * https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
 * (and other places)
 */

function addJS(urlString) {
    let head = document.getElementsByTagName('head')[0];

    let js = document.createElement('script');
    js.src = urlString;
    js.crossorgin = 'anonymous';
    head.append(js);
}

/******************************************************************
 * changeJqueryTheme( themeName)
 * - given a theme name, remove the old jQuery theme css and replace
 *   it with the new one
 */

var JQUERY_THEMES = ['base', 'start', 'smoothness', 'redmond', 'sunny',
    'overcast', 'flick', 'pepper-grinder', 'ui-lightness', 'ui-darkness',
    'le-frog', 'eggplant', 'dark-hive', 'cupertino', 'blitzer', 'south-street',
    'humanity', 'hot-sneaks', 'excite-bike', 'vader', 'black-tie', 'trontastic',
    'swanky-purse'
];

function changeJqueryTheme(themeName) {
    // Convert the themeName to lower case with dash separation
    themeName = themeName.toLowerCase().replace(/\s+/g, '-');

    // does the new theme CSS file actually exist? / is it a valid theme name
    if (!JQUERY_THEMES.includes(themeName)) {
        return false;
    }

    // remove the old theme CSS
    jQuery("#gu_jqueryTheme").attr("disabled", "disabled");

    // add the new one
    let urlString = `
    //code.jquery.com/ui/1.12.1/themes/${themeName}/jquery-ui.css
    `;

    var head = document.getElementsByTagName('head')[0];

    var style = document.createElement('link');
    style.href = urlString;
    style.id = "gu_jqueryTheme";
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
}

/*****************************************************************
* handleFilmWatchingOptions
* - given a span with the name of a film convert it into text
*    We've been unable to provide a copy of this fil..
*/


/**** 
 * fetchFilmUrl
 * Given name of a film and a flow URL generate an async JSON request
 * to get the available URL for the film
 */

async function fetchFilmURL(filmName, flowUrl) {
    let data = {};
    data.filmTitle = filmName;

    //        'item': 'filmWatchingOptionsFlowURL',
    //    console.log("body is " + JSON.stringify(data));
    //    console.log(" sending off to " + FILM_WATCHING_FLOW);
    const response = await fetch(flowUrl, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

function handleFilmWatchingOptions() {
    let filmName = jQuery(this).text().trim();
    let filmNameEsc = encodeURIComponent(filmName);

    let filmUrl;
    let flowUrl = PARAMS.filmWatchingOptionsFlowURL;

    // stop if flowUrl isn't defined
    if (typeof flowUrl === 'undefined') {
        console.log("Error: no flow URL defined");
        return false;
    }

    // Get the film's URL
    fetchFilmURL(filmName, flowUrl).then(data => {
        var html = '';

        // Flow returned a URL
        if ('url' in data && data.url !== '') {
            // Found a URL for the film
            filmUrl = data.url;

            // convert it into an embeddable player (if possible)
            html = convertMedia(data.url, filmName);


            // if it wasn't converted, just do the URL
            if (html === '') {
                html = `
                <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage"></div>
      <div class="instructions">
         <p>Access a copy of <a href="${data.url}"><em>${filmName}</em> here</a></p>
       </div>
    </div>
                `;
            }
        }

        // if still no HTML, then point to JustWatch
        if (html === '') {
            // didn't find film do the default justWatch search
            html = `
    <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage"></div>
      <div class="instructions">
         <p>We've been unable to provide a copy <em>${filmName}</em>.</p>
         <p><a href="https://www.justwatch.com/au/search?q=${filmNameEsc}" target="_blank">This search on JustWatch</a> may provide pointers to where you can find it online.</p>
       </div>
    </div>`;
        }

        jQuery(this).replaceWith(html);
    });

}

/************************************
 * html = convertMedia(link)
 * - given a link to a video return the iframe embed player
 * - support: Stream, YouTube, Vimeo, Kanopy
 */


function convertMedia(html, filmName) {
    // based on: http://jsfiddle.net/oriadam/v7b5edo8/   http://jsfiddle.net/88Ms2/378/   https://stackoverflow.com/a/22667308/3356679
    var cls = 'class="embedded-media"';
    var frm = '<iframe width="640" height="480" ' + cls + ' src="//_URL_" frameborder="0" allowfullscreen></iframe>';

    // Haven't figured out how to generate an embeddable player for Kanopy yet
    if (html.match(/griffith.kanopy.com/)) {
        return `
    <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage"></div>
      <div class="instructions">
         <p>You can watch <em>${filmName}</em> on <a href="${html}">Kanopy</a></p>
       </div>
    </div>`;
    }

    var converts = [
        {  // Internet archive
            rx: new RegExp('^.*archive.org\/details\/([^\/]+)$', 'g'),
            tmpl: frm.replace('_URL_', "archive.org/embed/$1")
        },
        {  // MS-Stream
            rx: /^.*microsoftstream.com\/video\/([^\/]+)$/g,
            tmpl: frm.replace('_URL_', "web.microsoftstream.com/embed/video/$1")
        },
        {  // Vimeo
            rx: /^(?:https?:)?\/\/(?:www\.)?vimeo\.com\/([^\?&"]+).*$/g,
            tmpl: frm.replace('_URL_', "player.vimeo.com/video/$1")
        },
        {  // YouTube
            rx: /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|user\/.+\/)?([^\?&"]+).*$/g,
            tmpl: frm.replace('_URL_', "www.youtube.com/embed/$1")
        },
        {
            rx: /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube-nocookie\.com)\/(?:watch\?v=|embed\/|v\/|user\/.+\/)?([^\?&"]+).*$/g,
            tmpl: frm.replace('_URL_', "www.youtube-nocookie.com/embed/$1")
        },
        {
            rx: /(^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?\.(?:jpe?g|gif|png|svg)\b.*$)/gi,
            tmpl: '<a ' + cls + ' href="$1" target="_blank"><img src="$1" /></a>'
        },
    ];

    let returning = '';
    converts.forEach(function (elem) {
        m = html.trim().match(elem.rx);
        if (m) {
            returning = html.trim().replace(elem.rx, elem.tmpl);
        }
    });
    return returning;
}

// ****************************************************
// addExpandPrintButtons
// - check if URL is set up to provide a print version
// - if so add a print button to 

const PRINT_URLS = {
    'http://127.0.0.1:8080/test/': 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1',
    // --- COM10 **TODO** Need to move the IDs to something based on the title and the course id (to make it study period independent?)
    // Intro
    // 1
    "id82017155859821" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeAq5L5wb41Gns6slW0A-LwB3Yq83TythhGI6ggFcBTndg?download=1',
    // 2
    "id82017155859981" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EbAqgkfJIx5Nqvd_jK1U5NIB6CPlm-EXVEQdkJwQiRWLMA?download=1',
    // 3 
    "id82017155860101" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWNzglpqvdVEjTgpgmtNNpwB-FAAejeXf2-EfrMbelEBBw?download=1',
    // 4
    "id82017155860221" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQpfz6EuZmVHn8nlehy86u4BCoBPoLCMQbEClzbtTOtA6Q?download=1',
    // 5 
    "id82017155860361" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ERVcxqM6xI9PnlXJTIqWleABB9vN7i6NMkYZvey6aLmbvw?download=1',
    // 6
    "id82017155860471" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaMscQciQ2pLrFZLcEoOXccB1n24bXe1nLSKOpYkjV2N5w?download=1',
    // 7 
    "id82017155860591" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EULKp4LeFF1LujF5UFl8OHABeWORvVEkOo_ylQvzvY_40Q?download=1',
    // 8
    "id82017155860721" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYiaNSNnTYJNm3VBn4Qe350BFlUIdGhtVov0HEq81RRU5g?download=1',
    // 9
    "id82017155860821" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeWjaWYjEgpHlizwaT0Lf-gBE8eJF8gqSIS6Gdx_-0VAbw?download=1',
    // 10
    "id82017155860921" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ES7T_sNVEEJCgTNCCSBvBMgBygkyvthRxCFe0esIQBbjgQ?download=1',
    // 11
    "id82017155861001" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ES4-c714D-1Liv7CE0XTNJABhpiF9bJxs3NywdwrZA72Vg?download=1',
    //12
    "id82017155861081" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1',
    "id82017155861101" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1',
    //13
    "id82017155861181" :"https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXO1cl-sEeZEj3H9O9acJikBghpbdwyyoKa3UDOPt4mvSQ?download=1",
    "id82017155861161" :"https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXO1cl-sEeZEj3H9O9acJikBghpbdwyyoKa3UDOPt4mvSQ?download=1",
    // assessment
    // 1
    "id82017155859351" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaovQ_phUEVBuUcv6T_-Nq8Beo9pfI5gGLTeXgZor8SteQ?download=1",
    // 2
    "id82017155859441" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ed1VsUZpHT1KlnNenO-MxugBfkzxvGw-ipxMjCZaHqej_Q?download=1",
    // 3
    "id82017155859501" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWqc_YnmVyZCsfInw968XaQBPjPOB4kbToSVYzqnQoiw4g?download=1",
    // Resources
    "id82017155859601" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ER3stuIbjQFEi2TFu22qMvgBB_TQPKr3YQqp25RatuxqQA?download=1"
};

function addExpandPrintButtons() {

    // add the expand buttons
    jQuery("#GU_ContentInterface").prepend(EXPAND_COLLAPSE_BUTTON_HTML);

    // should we add a print button?
    pdfUrl = getPrintButtons();
    if (pdfUrl) {
        const print_button = `
    <button href="type="button" onclick="window.open('${pdfUrl}')"
      >Download PDF</button>
    `;
        jQuery('.accordion-expand-holder').append(print_button);
    }
}

function getPrintButtons() {
    const x = window.location.href;

    // handle the simple test case
    if (x in PRINT_URLS) {
        return PRINT_URLS[x];
    }
    // break the Bb URL into script (listContent.jsp) courseId contentId
    let hrefId = getHrefId(x);
    // able to extract hrefId
    if (hrefId !== x) {
        hrefId = "id" + hrefId.replaceAll('/','');
        hrefId = hrefId.replaceAll('_','');
        console.log("hrefid " + hrefId);
        if (hrefId in PRINT_URLS) {
            return PRINT_URLS[hrefId];
        }
    }

    return false;
}